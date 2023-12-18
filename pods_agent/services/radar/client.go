package radar

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"mime/multipart"
	"net"
	"net/http"
	"net/url"
	"runtime"
	"strings"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/go-monitor/pkg/sentry"
	"github.com/exactlylabs/radar/pods_agent/agent"
	"github.com/exactlylabs/radar/pods_agent/services/radar/cable"
	"github.com/exactlylabs/radar/pods_agent/services/radar/messages"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo"
)

// firstPing since the service has started. It's set to false right after a successful ping
var firstPing = true

var _ agent.RadarClient = &RadarClient{}

const (
	RadarServerChannelName = "PodAgentChannel"
)

const AgentUserAgent = "RadarPodsAgent/"

const (
	Sync cable.CustomActionTypes = "sync"
	Pong cable.CustomActionTypes = "pong"
)

const (
	RunTest             cable.MessageType = "run_test"        // Custom Type, when requested, the agent should run a speed test
	UpdateClient        cable.MessageType = "update"          // Custom Type, when requested, the agent should update itself
	AgentUpdateWatchdog cable.MessageType = "update_watchdog" // Custom Type, when requested, the agent should update the watchdog binary
)

// RadarClient implements agent.RadarClient, connecting to the server using websocket
type RadarClient struct {
	serverURL string
	clientID  string
	secret    string
	channel   *cable.ChannelClient
	agentCh   chan<- *agent.ServerMessage
	connected bool
}

func NewClient(serverURL, clientID, secret string) *RadarClient {
	return &RadarClient{
		serverURL: serverURL,
		clientID:  clientID,
		secret:    secret,
	}
}

func (c *RadarClient) Close() error {
	return c.channel.Close()
}

func (c *RadarClient) Connect(ctx context.Context, ch chan<- *agent.ServerMessage) error {
	if c.clientID == "" || c.secret == "" {
		return errors.New("clientId and secret cannot be empty")
	}
	header := http.Header{}
	header.Set("User-Agent", AgentUserAgent+sysinfo.Metadata().Version)
	// Setting a header that is in the Forbidden Header Name -- Basically, any header starting with Sec-
	// https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name
	header.Set("Sec-Radar-Tool", "true")
	header.Set("Sec-Radar-Service-Started", fmt.Sprintf("%t", firstPing))
	c.channel = cable.NewChannel(c.serverURL, fmt.Sprintf("%s:%s", c.clientID, c.secret), RadarServerChannelName, header)
	c.agentCh = ch
	c.channel.OnSubscriptionMessage = c.handleSubscriptionMessage
	c.channel.OnCustomMessage = c.handleCustomMessage
	c.channel.OnSubscribed = c.sendSync
	c.channel.OnConnectionError = func(err error) {
		log.Println(errors.W(err))
		c.connected = false
	}
	c.channel.OnConnected = func() {
		c.connected = true
		log.Println("PodAgentChannel Connected")
	}
	if err := c.channel.Connect(ctx); err != nil {
		return errors.W(err)
	}
	return nil
}

func (c *RadarClient) Connected() bool {
	return c.connected
}

func (c *RadarClient) handleSubscriptionMessage(msg cable.SubscriptionMessage) {
	log.Println("Received Message from Server: ", msg.Event)
	if msg.Event == "test_requested" {
		c.agentCh <- &agent.ServerMessage{TestRequested: true}

	} else if msg.Event == "version_changed" || msg.Event == "watchdog_version_changed" {
		updateData := messages.VersionChangedSubscriptionPayload{}
		if err := json.Unmarshal(msg.Payload, &updateData); err != nil {
			err = errors.Wrap(err, "json.Unmarshal failed")
			sentry.NotifyError(
				err,
				map[string]sentry.Context{
					"Message": {"event": msg.Event, "payload": string(msg.Payload)},
				},
			)
			log.Println(err)
		}
		binUpdate := &agent.BinaryUpdate{
			Version:   updateData.Version,
			BinaryUrl: c.serverURL + updateData.BinaryUrl, // Websocket client only sends the path
		}

		serverMsg := &agent.ServerMessage{}
		if msg.Event == "version_changed" {
			serverMsg.Update = binUpdate
		} else if msg.Event == "watchdog_version_changed" {
			serverMsg.WatchdogUpdate = binUpdate
		}
		c.agentCh <- serverMsg
	}
}

func (c *RadarClient) handleCustomMessage(msg cable.ServerMessage) {
	switch msg.Type {
	case cable.Ping:
		c.sendPong()

	case RunTest:
		c.agentCh <- &agent.ServerMessage{TestRequested: true}

	case UpdateClient:
		payload := &messages.VersionChangedSubscriptionPayload{}
		if err := msg.DecodeMessage(payload); err != nil {
			err = errors.W(err)
			sentry.NotifyError(
				err,
				map[string]sentry.Context{
					"Message": {"type": msg.Type, "message": msg.Message},
				},
			)
			log.Println(err)
			return
		}
		c.agentCh <- &agent.ServerMessage{
			Update: &agent.BinaryUpdate{
				Version:   payload.Version,
				BinaryUrl: c.serverURL + payload.BinaryUrl, // Websocket client only sends the path
			},
		}
	case AgentUpdateWatchdog:
		payload := &messages.VersionChangedSubscriptionPayload{}
		if err := msg.DecodeMessage(payload); err != nil {
			err = errors.W(err)
			sentry.NotifyError(
				err,
				map[string]sentry.Context{
					"Message": {"type": msg.Type, "message": msg.Message},
				},
			)
			log.Println(err)
			return
		}
		c.agentCh <- &agent.ServerMessage{
			WatchdogUpdate: &agent.BinaryUpdate{
				Version:   payload.Version,
				BinaryUrl: c.serverURL + payload.BinaryUrl, // Websocket client only sends the path
			},
		}
	}
}

func (c *RadarClient) sendSync() {
	meta := sysinfo.Metadata()
	payload := messages.Sync{
		OSVersion:         runtime.GOOS,
		HardwarePlatform:  runtime.GOARCH,
		Distribution:      meta.Distribution,
		Version:           meta.Version,
		NetInterfaces:     meta.NetInterfaces,
		WatchdogVersion:   meta.WatchdogVersion,
		RegistrationToken: meta.RegistrationToken,
	}

	c.channel.SendAction(cable.CustomActionData{
		Action:  Sync,
		Payload: payload, // this should be decoupled?
	})
}

func (c *RadarClient) sendPong() {
	c.channel.SendAction(cable.CustomActionData{
		Action: Pong,
	})
}

func (c *RadarClient) Ping(meta *sysinfo.ClientMeta) (*agent.ServerMessage, error) {
	apiUrl := fmt.Sprintf("%s/clients/%s/status", c.serverURL, c.clientID)
	form := url.Values{}
	form.Add("secret", c.secret)
	form.Add("version", meta.Version)
	form.Add("distribution", meta.Distribution)
	form.Add("watchdog_version", meta.WatchdogVersion)
	form.Add("os_version", runtime.GOOS)
	form.Add("hardware_platform", runtime.GOARCH)
	form.Add("service_first_ping", fmt.Sprintf("%t", firstPing))
	ifaces, err := json.Marshal(meta.NetInterfaces)
	if err != nil {
		return nil, errors.Wrap(err, "marshalling NetInterfaces failed").WithMetadata(errors.Metadata{"interfaces": fmt.Sprintf("%v", meta.NetInterfaces)})
	}
	form.Add("network_interfaces", string(ifaces))
	req, err := NewRequest(http.MethodPost, apiUrl, strings.NewReader(form.Encode()))
	if err != nil {
		return nil, errors.W(err)
	}
	req.Header.Add("Accept", "application/json")
	if meta.RegistrationToken != nil {
		req.Header.Add("Authorization", fmt.Sprintf("Token %s", *meta.RegistrationToken))
	}
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, errors.Wrap(err, "request failed")
	}
	if resp.StatusCode != 200 {
		return nil, errors.New("radarClient#Ping wrong status code %d", resp.StatusCode)
	}
	firstPing = false
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, errors.Wrap(err, "error reading response")
	}
	podConfig := &PodConfigs{}
	if err := json.Unmarshal(body, podConfig); err != nil {
		return nil, errors.Wrap(err, "error unmarshalling").WithMetadata(errors.Metadata{"body": string(body)})
	}
	res := &agent.ServerMessage{
		TestRequested: podConfig.TestRequested,
	}
	if podConfig.Update != nil {
		res.Update = &agent.BinaryUpdate{
			Version:   podConfig.Update.Version,
			BinaryUrl: fmt.Sprintf("%s/%s", c.serverURL, podConfig.Update.Url),
		}
	}
	if podConfig.WatchdogUpdate != nil {
		res.WatchdogUpdate = &agent.BinaryUpdate{
			Version:   podConfig.WatchdogUpdate.Version,
			BinaryUrl: fmt.Sprintf("%s/%s", c.serverURL, podConfig.WatchdogUpdate.Url),
		}
	}
	return res, nil
}

func (c *RadarClient) Register(registrationToken *string) (*agent.RegisteredPod, error) {
	apiUrl := fmt.Sprintf("%s/clients", c.serverURL)
	req, err := http.NewRequest(http.MethodPost, apiUrl, nil)
	if err != nil {
		return nil, errors.Wrap(err, "http.NewRequest failed")
	}
	req.Header.Add("Accept", "application/json")
	if registrationToken != nil {
		req.Header.Add("Authorization", fmt.Sprintf("Token %s", *registrationToken))
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, errors.Wrap(err, "request failed")
	}
	if resp.StatusCode != 201 {
		return nil, errors.New("radarClient#Register wrong status code %d", resp.StatusCode)
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, errors.Wrap(err, "error reading response")
	}
	p := &Pod{}
	if err := json.Unmarshal(body, p); err != nil {
		return nil, errors.Wrap(err, "error unmarshalling").WithMetadata(errors.Metadata{"body": string(body)})
	}
	c.clientID = p.ClientId
	c.secret = p.Secret
	return &agent.RegisteredPod{
		ClientId: p.ClientId,
		Secret:   p.Secret,
	}, nil
}

func (c *RadarClient) SendMeasurement(ctx context.Context, style string, measurement []byte) error {
	apiUrl := fmt.Sprintf("%s/clients/%s/measurements", c.serverURL, c.clientID)

	// Create Form Data
	var b bytes.Buffer
	w := multipart.NewWriter(&b)
	// Style Field
	styleW, _ := w.CreateFormField("measurement[style]")
	styleW.Write([]byte(style))

	// Secret Field
	secretWriter, _ := w.CreateFormField("client_secret")
	secretWriter.Write([]byte(c.secret))

	// File Field
	fW, _ := w.CreateFormFile("measurement[result]", "result.json")
	fW.Write(measurement)
	w.Close()

	req, err := NewRequest(http.MethodPost, apiUrl, &b)
	if err != nil {
		return errors.W(err)
	}
	req.Header.Add("Content-Type", w.FormDataContentType())

	resp, err := http.DefaultClient.Do(req)
	if errors.Is(err, &net.DNSError{}) {
		// Likelly a timeout / any network reachability issue that is out of our control.
		return errors.SentinelWithStack(agent.ErrServerConnectionError)
	} else if err != nil {
		return errors.Wrap(err, "request failed").WithMetadata(errors.Metadata{"url": req.URL, "method": req.Method})
	}

	if resp.StatusCode != 201 {
		return errors.New("radar.radarClient#SendMeasurement wrong status code: %d", resp.StatusCode)
	}
	return nil
}

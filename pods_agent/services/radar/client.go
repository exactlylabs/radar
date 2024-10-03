package radar

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net"
	"net/http"
	"runtime"

	"github.com/exactlylabs/go-errors/pkg/errors"
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
	RunTest       cable.MessageType = "run_test"       // Custom Type, when requested, the agent should run a speed test
	TestRequested cable.MessageType = "test_requested" // same as run_test, but sent through the subscription channel

	UpdateClient         cable.MessageType = "update"          // Custom Type, when requested, the agent should update itself
	ClientVersionChanged cable.MessageType = "version_changed" // same as update, but sent through the subscription channel

	AgentUpdateWatchdog         cable.MessageType = "update_watchdog"          // Custom Type, when requested, the agent should update the watchdog binary
	AgentWatchdogVersionChanged cable.MessageType = "watchdog_version_changed" // same as update_watchdog, but sent through the subscription channel
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

func (c *RadarClient) Connect(ch chan<- *agent.ServerMessage) error {
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
	c.channel.OnMessage = c.handleMessage
	c.channel.OnSubscribed = c.requestSync
	c.channel.OnConnectionError = func(err error) {
		log.Println(errors.W(err))
		c.connected = false
	}
	c.channel.OnConnected = func() {
		c.connected = true
		firstPing = false
		header.Set("Sec-Radar-Service-Started", "false")
		log.Println("PodAgentChannel Connected")
	}
	if err := c.channel.Connect(); err != nil {
		return errors.W(err)
	}
	return nil
}

func (c *RadarClient) Connected() bool {
	return c.connected
}

func (c *RadarClient) handleMessage(msg cable.ServerMessage) {
	switch msg.Type {
	case cable.Ping:
		c.sendPong()
		c.agentCh <- &agent.ServerMessage{
			Type: agent.HealthCheck,
			Data: agent.HealthCheckServerMessage{},
		}

	case TestRequested, RunTest:
		payload := cable.ParseMessage[*messages.TestRequestedSubscriptionPayload](msg)
		c.agentCh <- &agent.ServerMessage{
			Type: agent.RunTest,
			Data: agent.RunTestServerMessage{
				Interfaces: payload.Interfaces,
			},
		}

	case ClientVersionChanged, UpdateClient, AgentUpdateWatchdog, AgentWatchdogVersionChanged:
		payload := cable.ParseMessage[*messages.VersionChangedSubscriptionPayload](msg)
		if payload != nil {
			binUpdate := agent.UpdateBinaryServerMessage{
				Version:   payload.Version,
				BinaryUrl: c.serverURL + payload.BinaryUrl, // Websocket client only sends the path
			}

			var msgType agent.MessageType = agent.Update
			if msg.Type == AgentUpdateWatchdog || msg.Type == AgentWatchdogVersionChanged {
				msgType = agent.UpdateWatchdog
			}
			c.agentCh <- &agent.ServerMessage{
				Type: msgType,
				Data: binUpdate,
			}
		}

	}
}

func (c *RadarClient) requestSync() {
	c.agentCh <- &agent.ServerMessage{
		Type: agent.SyncRequested,
		Data: agent.SyncRequestedMessage{},
	}
}

func (c *RadarClient) sendPong() {
	c.channel.SendAction(cable.CustomActionData{
		Action: Pong,
	})
}

func (c *RadarClient) Ping(meta *sysinfo.ClientMeta) ([]agent.ServerMessage, error) {
	apiUrl := fmt.Sprintf("%s/clients/%s/status", c.serverURL, c.clientID)
	data := map[string]any{
		"version":            meta.Version,
		"distribution":       meta.Distribution,
		"watchdog_version":   meta.WatchdogVersion,
		"os_version":         runtime.GOOS,
		"hardware_platform":  runtime.GOARCH,
		"service_first_ping": fmt.Sprintf("%t", firstPing),
		"network_interfaces": meta.NetInterfaces,
	}
	dataBytes, err := json.Marshal(data)
	if err != nil {
		return nil, errors.W(err)
	}
	req, err := NewRequest(http.MethodPost, apiUrl, c.clientID, c.secret, bytes.NewReader(dataBytes))
	if err != nil {
		return nil, errors.W(err)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, errors.Wrap(err, "request failed")
	}
	if resp.StatusCode != 200 {
		return nil, errors.New("radarClient#Ping wrong status code %d", resp.StatusCode)
	}
	firstPing = false
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, errors.Wrap(err, "error reading response")
	}
	podConfig := &PodConfigs{}
	if err := json.Unmarshal(body, podConfig); err != nil {
		return nil, errors.Wrap(err, "error unmarshalling").WithMetadata(errors.Metadata{"body": string(body)})
	}
	msgs := make([]agent.ServerMessage, 0)

	if podConfig.TestRequested {
		msgs = append(msgs, agent.ServerMessage{
			Type: agent.RunTest,
			Data: agent.RunTestServerMessage{},
		})
	}

	if podConfig.Update != nil {
		msgs = append(msgs, agent.ServerMessage{
			Type: agent.Update,
			Data: agent.UpdateBinaryServerMessage{
				Version:   podConfig.Update.Version,
				BinaryUrl: fmt.Sprintf("%s/%s", c.serverURL, podConfig.Update.Url),
			},
		})
	}
	if podConfig.WatchdogUpdate != nil {
		msgs = append(msgs, agent.ServerMessage{
			Type: agent.UpdateWatchdog,
			Data: agent.UpdateBinaryServerMessage{
				Version:   podConfig.WatchdogUpdate.Version,
				BinaryUrl: fmt.Sprintf("%s/%s", c.serverURL, podConfig.WatchdogUpdate.Url),
			},
		})
	}
	return msgs, nil
}

func (c *RadarClient) Register(podInfo agent.RegisterPodInfo) (*agent.PodInfo, error) {
	apiUrl := fmt.Sprintf("%s/api/v1/clients", c.serverURL)

	reqBody := bytes.NewBuffer(nil)
	if err := json.NewEncoder(reqBody).Encode(podInfo); err != nil {
		return nil, errors.W(err)
	}

	req, err := NewRequest(http.MethodPost, apiUrl, c.clientID, c.secret, reqBody)
	if err != nil {
		return nil, errors.Wrap(err, "http.NewRequest failed")
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, errors.Wrap(err, "request failed")
	}
	if resp.StatusCode != 201 {
		return nil, errors.New("radarClient#Register wrong status code %d", resp.StatusCode)
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, errors.Wrap(err, "error reading response")
	}
	p := &agent.PodInfo{}
	if err := json.Unmarshal(body, p); err != nil {
		return nil, errors.Wrap(err, "error unmarshalling").WithMetadata(errors.Metadata{"body": string(body)})
	}
	c.clientID = p.ClientId
	c.secret = p.Secret
	return p, nil
}

func (c *RadarClient) SendMeasurement(ctx context.Context, style string, report agent.MeasurementReport) error {
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

	ifaceWriter, _ := w.CreateFormField("measurement[interface]")
	ifaceWriter.Write([]byte(report.Interface))

	wlanWriter, _ := w.CreateFormField("measurement[wireless]")
	wlanWriter.Write([]byte(fmt.Sprintf("%t", report.Wlan)))

	if report.ConnectionInfo != nil {
		connInfoWriter, _ := w.CreateFormField("connection_info")
		data, err := json.Marshal(report.ConnectionInfo)
		if err != nil {
			return errors.W(err)
		}
		connInfoWriter.Write(data)
	}

	// File Field
	fW, _ := w.CreateFormFile("measurement[result]", "result.json")
	fW.Write(report.Result)
	w.Close()

	req, err := NewRequest(http.MethodPost, apiUrl, c.clientID, c.secret, &b)
	if err != nil {
		return errors.W(err)
	}
	req.Header.Set("Content-Type", w.FormDataContentType())

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

// AssignPodToAccount that owns the accountToken. If network is given, it will try to either create a network, or link it to an existing if ID is given.
func (c *RadarClient) AssignPodToAccount(accountToken string, network *agent.NetworkData) (*agent.PodInfo, error) {
	apiUrl := fmt.Sprintf("%s/api/v1/clients/assign", c.serverURL)

	bodyBuffer := bytes.NewBuffer(nil)

	data := map[string]interface{}{
		"token": accountToken,
	}

	if network != nil {
		data["network"] = *network
	}

	if err := json.NewEncoder(bodyBuffer).Encode(data); err != nil {
		return nil, errors.W(err)
	}

	req, err := NewRequest(http.MethodPost, apiUrl, c.clientID, c.secret, bodyBuffer)
	if err != nil {
		return nil, errors.W(err)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, errors.W(err)
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, errors.W(err)
	}

	if resp.StatusCode != 200 {
		return nil, errors.New("wrong status code %d", resp.StatusCode).WithMetadata(errors.Metadata{"body": string(body)})
	}

	pod := &agent.PodInfo{}
	if err := json.Unmarshal(body, pod); err != nil {
		return nil, errors.Wrap(err, "error unmarshalling").WithMetadata(errors.Metadata{"body": string(body)})
	}

	return pod, nil
}

func (c *RadarClient) SyncData(data agent.Sync) error {
	err := c.channel.SendAction(cable.CustomActionData{
		Action:  Sync,
		Payload: data,
	})
	if err != nil {
		return errors.W(err)
	}
	return nil
}

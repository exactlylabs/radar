package radar

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"mime/multipart"
	"net/http"
	"net/url"
	"runtime"
	"strings"

	"github.com/exactlylabs/radar/agent/agent"
	"github.com/exactlylabs/radar/agent/services/radar/messages"
	"github.com/exactlylabs/radar/agent/services/sysinfo"
	"github.com/exactlylabs/radar/agent/services/ws"
	"github.com/exactlylabs/radar/agent/watchdog"
)

// firstPing since the service has started. It's set to false right after a successful ping
var firstPing = true

var _ agent.RadarClient = &RadarClient{}

const (
	RadarServerChannelName = "PodAgentChannel"
)

// RadarClient exposes methods to communicate with our Radar server
type RadarClient struct {
	serverURL   string
	clientID    string
	secret      string
	cli         *ws.Client[messages.ServerMessage]
	agentCh     chan<- *agent.ServerMessage
	wsConnected bool // When false, we enable the fallbacks to the HTTP method -- intended to SendMeasurements method
}

func NewClient(serverURL, clientID, secret string) *RadarClient {
	return &RadarClient{
		serverURL: serverURL,
		clientID:  clientID,
		secret:    secret,
	}
}

func (c *RadarClient) Connect(ctx context.Context, ch chan<- *agent.ServerMessage) error {
	c.agentCh = ch
	u, err := url.Parse(c.serverURL)
	if err != nil {
		return fmt.Errorf("radar.RadarClient#openConnection Parse: %w", err)
	}
	wsUrl := u
	if u.Scheme == "http" {
		wsUrl.Scheme = "ws"
	} else {
		wsUrl.Scheme = "wss"
	}
	wsUrl.Path = "/api/v1/clients/ws"
	header := http.Header{}
	header.Set("Authorization", fmt.Sprintf("Basic %s:%s", c.clientID, c.secret))
	c.cli = ws.New(wsUrl.String(), header,
		ws.WithOnConnected(c.onConnected),
		ws.WithConnectionErrorCallback[messages.ServerMessage](c.onConnectionError),
	)
	if err := c.cli.Connect(); err != nil {
		return fmt.Errorf("radar.RadarClient#Connect Connect: %w", err)
	}
	go c.listenToMessages()
	c.wsConnected = true
	return nil
}

func (c *RadarClient) Close() error {
	return c.cli.Close()
}

func (c *RadarClient) onConnected(cli *ws.Client[messages.ServerMessage]) {
	// Subscribe to channels
	c.cli.Sender() <- messages.ClientMessage{
		Command: messages.Subscribe,
		Identifier: &messages.Identifier{
			Channel: RadarServerChannelName,
		},
	}
}

func (c *RadarClient) onConnectionError(error) {
	// Fallback to the old ping
	// TODO: Implement a MetadataProvider injector
	meta := sysinfo.Metadata()
	msg, err := c.Ping(meta)
	if err != nil {
		log.Println(fmt.Errorf("radar.RadarClient#Connect Ping: %w", err))
	} else {
		c.agentCh <- msg
	}
}

// listenToMessages keeps reading from the Client channel, until it is closed.
func (c *RadarClient) listenToMessages() {
	for msg := range c.cli.Receiver() {
		if msg.Type == messages.ConfirmSubscription {
			c.sendSync()
		} else if msg.Type == messages.Ping {
			c.sendPong()
		} else if msg.Type == messages.RunTest {
			c.agentCh <- &agent.ServerMessage{TestRequested: true}
		} else if msg.Type == messages.Update {
			// TODO: add message parsing here
		} else if msg.Identifier != nil {
			c.handleSubscriptionMessage(msg)
		}
	}
}

func (c *RadarClient) handleSubscriptionMessage(msg messages.ServerMessage) {
	if msg.Identifier.Channel != RadarServerChannelName {
		return
	}
	msgData := messages.SubscriptionMessage{}
	msg.DecodeMessage(&msgData)
	if msgData.Event == "test_requested" {
		c.agentCh <- &agent.ServerMessage{TestRequested: true}
	} else if msgData.Event == "version_changed" {
		if err := c.updateRequested(msgData); err != nil {
			log.Println(err)
			return
		}
	}
}

func (c *RadarClient) updateRequested(msg messages.SubscriptionMessage) error {
	payload := messages.UpdateRequestedSubscriptionPayload{}
	if err := json.Unmarshal(msg.Payload, &payload); err != nil {
		return fmt.Errorf("radar.RadarClient#Connect Unmarshal: %w", err)
	}
	c.agentCh <- &agent.ServerMessage{
		WatchdogUpdate: payload.Watchdog,
		Update:         payload.Client,
	}
	return nil
}

func (c *RadarClient) sendSync() {
	c.cli.Sender() <- messages.ClientMessage{
		Identifier: &messages.Identifier{
			Channel: RadarServerChannelName,
		},
		Command: messages.Message,
		ActionData: &messages.CustomActionData{
			Action:  messages.Sync,
			Payload: sysinfo.Metadata(),
		},
	}
}

func (c *RadarClient) sendPong() {
	c.cli.Sender() <- messages.ClientMessage{
		Identifier: &messages.Identifier{
			Channel: RadarServerChannelName,
		},
		Command: messages.Message,
		ActionData: &messages.CustomActionData{
			Action: messages.Pong,
		},
	}
}

func (c *RadarClient) NewRequest(method, url string, body io.Reader) (*http.Request, error) {
	req, err := http.NewRequest("POST", url, body)
	if err != nil {
		return nil, fmt.Errorf("radarClient#Register error creating request: %w", err)
	}
	req.Header.Add("Accept", "application/json")
	return req, nil
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
		return nil, fmt.Errorf("radarClient#Ping error marshalling NetInterfaces: %w", err)
	}
	form.Add("network_interfaces", string(ifaces))
	req, err := c.NewRequest("POST", apiUrl, strings.NewReader(form.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Add("Accept", "application/json")
	if meta.RegistrationToken != nil {
		req.Header.Add("Authorization", fmt.Sprintf("Token %s", *meta.RegistrationToken))
	}
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("radarClient#Ping request error: %w", err)
	}
	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("radarClient#Ping wrong status code %d", resp.StatusCode)
	}
	firstPing = false
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("radarClient#Ping error reading response: %w", err)
	}
	podConfig := &PodConfigs{}
	if err := json.Unmarshal(body, podConfig); err != nil {
		return nil, fmt.Errorf("radarClient#Ping error unmarshalling: %w", err)
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
	req, err := http.NewRequest("POST", apiUrl, nil)
	if err != nil {
		return nil, fmt.Errorf("radarCLient#Register error creating request: %w", err)
	}
	req.Header.Add("Accept", "application/json")
	if registrationToken != nil {
		req.Header.Add("Authorization", fmt.Sprintf("Token %s", *registrationToken))
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("radarClient#Register request error: %w", err)
	}
	if resp.StatusCode != 201 {
		return nil, fmt.Errorf("radarClient#Register wrong status code %d", resp.StatusCode)
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("radarClient#Register error reading response: %w", err)
	}
	p := &Pod{}
	if err := json.Unmarshal(body, p); err != nil {
		return nil, fmt.Errorf("radarClient#Register error unmarshalling: %w", err)
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

	req, err := c.NewRequest("POST", apiUrl, &b)
	if err != nil {
		return err
	}
	req.Header.Add("Content-Type", w.FormDataContentType())
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("radar.radarClient#ReportMeasurement request error: %w", err)
	}
	if resp.StatusCode != 201 {
		return fmt.Errorf("radar.radarClient#ReportMeasurement wrong status code: %d", resp.StatusCode)
	}
	return nil
}

func (c *RadarClient) WatchdogPing(meta *sysinfo.ClientMeta) (*watchdog.PingResponse, error) {
	apiUrl := fmt.Sprintf("%s/clients/%s/watchdog_status", c.serverURL, c.clientID)
	form := url.Values{}
	form.Add("secret", c.secret)
	form.Add("version", meta.Version)
	req, err := c.NewRequest("POST", apiUrl, strings.NewReader(form.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Add("Accept", "application/json")
	if meta.RegistrationToken != nil {
		req.Header.Add("Authorization", fmt.Sprintf("Token %s", *meta.RegistrationToken))
	}
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("radarClient#WatchdogPing request error: %w", err)
	}
	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("radarClient#WatchdogPing wrong status code %d", resp.StatusCode)
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("radarClient#WatchdogPing error reading response: %w", err)
	}
	podConfig := &WatchdogStatusResponse{}
	if err := json.Unmarshal(body, podConfig); err != nil {
		return nil, fmt.Errorf("radarClient#WatchdogPing error unmarshalling: %w", err)
	}
	res := &watchdog.PingResponse{}
	if podConfig.Update != nil {
		res.Update = &watchdog.BinaryUpdate{
			Version:   podConfig.Update.Version,
			BinaryUrl: fmt.Sprintf("%s/%s", c.serverURL, podConfig.Update.Url),
		}
	}
	return res, nil
}

package radar

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"strings"

	"github.com/exactlylabs/radar/pods_agent/services/radar/cable"
	"github.com/exactlylabs/radar/pods_agent/services/radar/messages"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo"
	"github.com/exactlylabs/radar/pods_agent/services/tracing"
	"github.com/exactlylabs/radar/pods_agent/watchdog"
)

var _ watchdog.WatchdogClient = &RadarWatchdogClient{}

const (
	WatchdogChannelName = "WatchdogChannel"
)

var WatchdogUserAgent = "RadarPodsWatchdog/"

const (
	UpdateWatchdog cable.MessageType = "update" // Custom Type, when requested, the agent should update itself
)

// RadarWatchdogClient implements watchdog.WatchdogClient, connecting to the server using websocket
type RadarWatchdogClient struct {
	serverURL string
	clientID  string
	secret    string
	channel   *cable.ChannelClient
	returnCh  chan<- watchdog.ServerMessage
	connected bool
}

func NewWatchdogClient(serverURL, clientID, secret string) *RadarWatchdogClient {
	return &RadarWatchdogClient{
		serverURL: serverURL,
		clientID:  clientID,
		secret:    secret,
	}
}

func (c *RadarWatchdogClient) Connect(ctx context.Context, ch chan<- watchdog.ServerMessage) error {
	h := http.Header{}
	h.Set("User-Agent", WatchdogUserAgent+sysinfo.Metadata().Version)
	// Setting a header that is in the Forbidden Header Name -- Basically, any header starting with Sec-
	// https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name
	h.Set("Sec-Radar-Tool", "true")
	c.channel = cable.NewChannel(c.serverURL, fmt.Sprintf("%s:%s", c.clientID, c.secret), WatchdogChannelName, h)
	c.returnCh = ch
	c.channel.OnSubscriptionMessage = c.handleSubscriptionMessage
	c.channel.OnCustomMessage = c.handleCustomMessage
	c.channel.OnSubscribed = c.sendSync
	c.channel.OnConnectionError = func(error) {
		c.connected = false
	}
	c.channel.OnConnected = func() {
		c.connected = true
		log.Println("WatchdogChannel connected")
	}
	if err := c.channel.Connect(ctx); err != nil {
		return fmt.Errorf("radar.RadarWatchdogClient#Connect Connect: %w", err)
	}
	return nil
}

func (c *RadarWatchdogClient) Connected() bool {
	return c.connected
}

func (c *RadarWatchdogClient) Close() error {
	return c.channel.Close()
}

func (c *RadarWatchdogClient) handleSubscriptionMessage(msg cable.SubscriptionMessage) {
	if msg.Event == "version_changed" {
		updateData := messages.VersionChangedSubscriptionPayload{}
		if err := json.Unmarshal(msg.Payload, &updateData); err != nil {
			err = fmt.Errorf("radar.RadarWatchdogClient#updateRequested Unmarshal: %w", err)
			tracing.NotifyError(
				err,
				tracing.Context{
					"Message": {"event": msg.Event, "payload": string(msg.Payload)},
				},
			)
			log.Println(err)
		}
		c.returnCh <- watchdog.ServerMessage{
			Update: &watchdog.BinaryUpdate{
				Version:   updateData.Version,
				BinaryUrl: c.serverURL + updateData.BinaryUrl, // Websocket client only sends the path
			},
		}
	}
}

func (c *RadarWatchdogClient) handleCustomMessage(msg cable.ServerMessage) {
	switch msg.Type {
	case UpdateWatchdog:
		payload := &messages.VersionChangedSubscriptionPayload{}
		if err := msg.DecodeMessage(payload); err != nil {
			err = fmt.Errorf("radar.RadarWatchdogClient#handleCustomMessage DecodeMessage: %w", err)
			tracing.NotifyError(err,
				tracing.Context{
					"Message": {"type": msg.Type, "message": msg.Message},
				},
			)
			log.Println(err)
			return
		}
		c.returnCh <- watchdog.ServerMessage{
			Update: &watchdog.BinaryUpdate{
				Version:   payload.Version,
				BinaryUrl: c.serverURL + payload.BinaryUrl, // Websocket client only sends the path
			},
		}
	}
}

func (c *RadarWatchdogClient) sendSync() {
	c.channel.SendAction(cable.CustomActionData{
		Action:  Sync,
		Payload: sysinfo.Metadata(), // this should be decoupled?
	})
}

func (c *RadarWatchdogClient) WatchdogPing(meta *sysinfo.ClientMeta) (*watchdog.ServerMessage, error) {
	apiUrl := fmt.Sprintf("%s/clients/%s/watchdog_status", c.serverURL, c.clientID)
	form := url.Values{}
	form.Add("secret", c.secret)
	form.Add("version", meta.Version)
	req, err := NewRequest("POST", apiUrl, strings.NewReader(form.Encode()))
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
	res := &watchdog.ServerMessage{}
	if podConfig.Update != nil {
		res.Update = &watchdog.BinaryUpdate{
			Version:   podConfig.Update.Version,
			BinaryUrl: fmt.Sprintf("%s/%s", c.serverURL, podConfig.Update.Url),
		}
	}
	return res, nil
}

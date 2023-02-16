package cable

import (
	"context"
	"fmt"
	"net/http"
	"net/url"

	"github.com/exactlylabs/radar/agent/services/radar/messages"
	"github.com/exactlylabs/radar/agent/services/sysinfo"
	"github.com/exactlylabs/radar/agent/services/ws"
	"github.com/google/uuid"
)

const (
	Sync messages.CustomActionTypes = "sync"
	Pong messages.CustomActionTypes = "pong"
)

// SubscriptionCallback is called when receiving a message from the topic subscribed in the server
type SubscriptionCallback func(messages.SubscriptionMessage)

// CustomMessageCallback is called whenever a non subscription message is received
// and it is not of a type that was expected by the client.
type CustomMessageCallback func(messages.ServerMessage)

// ChannelClient subscribes to a specific channel and handles the default connection steps.
// To process the subscription messages or other type of events, set the "On[XXX]" callback variables
type ChannelClient struct {
	ServerURL   string
	Auth        string
	cli         *ws.Client[messages.ServerMessage]
	ChannelName string
	identifier  messages.Identifier
	header      http.Header

	// Callbacks
	OnConnected           func()
	OnConnectionError     func(error)
	OnSubscribed          func()
	OnSubscriptionMessage SubscriptionCallback
	OnCustomMessage       CustomMessageCallback
}

func NewChannel(serverUrl, auth, channelName string, customHeader http.Header) *ChannelClient {
	customHeader.Set("Authorization", "Basic "+auth)
	return &ChannelClient{
		ServerURL:   serverUrl,
		Auth:        auth,
		ChannelName: channelName,
		header:      customHeader,
		identifier: messages.Identifier{
			Channel: channelName,
			Id:      uuid.NewString(),
		},
	}
}

func (c *ChannelClient) Connect(ctx context.Context) error {
	u, err := url.Parse(c.ServerURL)
	if err != nil {
		return fmt.Errorf("radar.RadarClient#Connect Parse: %w", err)
	}
	wsUrl := u
	if u.Scheme == "http" {
		wsUrl.Scheme = "ws"
	} else {
		wsUrl.Scheme = "wss"
	}
	wsUrl.Path = "/api/v1/clients/ws"
	c.cli = ws.New(wsUrl.String(), c.header,
		ws.WithOnConnected(c.onConnected),
		ws.WithConnectionErrorCallback[messages.ServerMessage](c.onConnectionError),
	)
	if err := c.cli.Connect(); err != nil {
		return fmt.Errorf("radar.RadarClient#Connect Connect: %w", err)
	}
	go c.listenToMessages()
	return nil
}

func (c *ChannelClient) Close() error {
	return c.cli.Close()
}

func (c *ChannelClient) onConnected(cli *ws.Client[messages.ServerMessage]) {
	// Subscribe to channels
	c.cli.Sender() <- messages.ClientMessage{
		Command:    messages.Subscribe,
		Identifier: &c.identifier,
	}
	if c.OnConnected != nil {
		c.OnConnected()
	}
}

func (c *ChannelClient) onConnectionError(err error) {
	if c.OnConnectionError != nil {
		c.OnConnectionError(err)
	}
}

// listenToMessages keeps reading from the Client channel, until it is closed.
func (c *ChannelClient) listenToMessages() {
	for msg := range c.cli.Receiver() {
		switch msg.Type {
		case messages.ConfirmSubscription:
			c.sendSync()
			if c.OnSubscribed != nil {
				c.OnSubscribed()
			}

		case messages.Ping:
			c.sendPong()

		default:
			if msg.Identifier != nil && c.OnSubscriptionMessage != nil {
				msgData := messages.SubscriptionMessage{}
				msg.DecodeMessage(&msgData)
				c.OnSubscriptionMessage(msgData)
			} else if c.OnCustomMessage != nil {
				c.OnCustomMessage(msg)
			}

		}
	}
}

func (c *ChannelClient) SendAction(msg messages.CustomActionData) {
	c.cli.Sender() <- messages.ClientMessage{
		Identifier: &c.identifier,
		Command:    messages.Message,
		ActionData: &msg,
	}
}

func (c *ChannelClient) sendSync() {
	c.SendAction(messages.CustomActionData{
		Action:  Sync,
		Payload: sysinfo.Metadata(), // this should be decoupled?
	})
}

func (c *ChannelClient) sendPong() {
	c.SendAction(messages.CustomActionData{
		Action: Pong,
	})
}

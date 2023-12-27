package cable

import (
	"context"
	"encoding/json"
	"net/http"
	"net/url"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/go-monitor/pkg/sentry"
	"github.com/exactlylabs/radar/pods_agent/services/ws"
	"github.com/google/uuid"
)

// MessageCallback has all messages received from the server.
// To know what type of message it is, check the "Type" field. If "SubscriptionMessageType", then "Message" is a SubscriptionMessage struct otherwise it is left untouched by the parser.
type MessageCallback func(ServerMessage)

// ChannelClient subscribes to a specific channel and handles the default connection steps.
// To process the subscription messages or other type of events, set the "On[XXX]" callback variables
type ChannelClient struct {
	ServerURL   string
	Auth        string
	cli         *ws.Client
	ChannelName string
	identifier  Identifier
	header      http.Header

	// Callbacks
	OnConnected       func()
	OnConnectionError func(error)
	OnSubscribed      func()
	OnMessage         MessageCallback
}

func NewChannel(serverUrl, auth, channelName string, customHeader http.Header) *ChannelClient {
	customHeader.Set("Authorization", "Basic "+auth)
	return &ChannelClient{
		ServerURL:   serverUrl,
		Auth:        auth,
		ChannelName: channelName,
		header:      customHeader,
		identifier: Identifier{
			Channel: channelName,
			Id:      uuid.NewString(),
		},
	}
}

func (c *ChannelClient) Connect(ctx context.Context) error {
	u, err := url.Parse(c.ServerURL)
	if err != nil {
		return errors.Wrap(err, "url.Parse failed")
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
		ws.WithConnectionErrorCallback(c.onConnectionError),
	)
	if err := c.cli.Connect(); err != nil {
		return errors.Wrap(err, "websocket client failed to connect")
	}
	go func() {
		defer sentry.NotifyIfPanic()
		c.listenToMessages()
	}()
	return nil
}

func (c *ChannelClient) Close() error {
	return c.cli.Close()
}

func (c *ChannelClient) onConnected(cli *ws.Client) {
	// Subscribe to channels
	c.cli.Sender() <- ClientMessage{
		Command:    Subscribe,
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
	for rcvMsg := range c.cli.Receiver() {
		msg := ServerMessage{}
		if err := json.Unmarshal(rcvMsg.Data, &msg); err != nil {
			panic(errors.Wrap(err, "json.Unmarshal failed"))
		}
		switch msg.Type {
		case ConfirmSubscription:
			if c.OnSubscribed != nil {
				c.OnSubscribed()
			}
		default:
			if msg.Identifier != nil && msg.Type == "" {
				// Subscription Broadcasted Message
				subData := ParseMessage[SubscriptionMessage](msg)
				msg.Type = MessageType(subData.Event)
				msg.Message = subData.Payload
			}
			if c.OnMessage != nil {
				c.OnMessage(msg)
			}
		}
	}
}

func (c *ChannelClient) SendAction(msg CustomActionData) {
	c.cli.Sender() <- ClientMessage{
		Identifier: &c.identifier,
		Command:    Message,
		ActionData: &msg,
	}
}

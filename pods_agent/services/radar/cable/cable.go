package cable

import (
	"encoding/json"
	"log"
	"net/http"
	"net/url"
	"time"

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
	ServerURL           string
	Auth                string
	cli                 *ws.Client
	ChannelName         string
	SubscriptionTimeout time.Duration
	subscription        *Identifier
	header              http.Header

	// Callbacks
	OnConnected       func()
	OnConnectionError func(error)
	OnSubscribed      func()
	OnMessage         MessageCallback
}

func NewChannel(serverUrl, auth, channelName string, customHeader http.Header) *ChannelClient {
	customHeader.Set("Authorization", "Basic "+auth)
	return &ChannelClient{
		ServerURL:           serverUrl,
		Auth:                auth,
		ChannelName:         channelName,
		SubscriptionTimeout: time.Second * 10,
		header:              customHeader,
	}
}

func (c *ChannelClient) Connect() error {
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
	c.subscribeToChannel()
	if c.OnConnected != nil {
		c.OnConnected()
	}
}

func (c *ChannelClient) subscribeToChannel() {
	log.Println("cable.ChannelClient#subscribeToChannel: Sending Subscription Request to channel:", c.ChannelName)
	c.cli.Sender() <- ClientMessage{
		Command: Subscribe,
		Identifier: &Identifier{
			Channel: c.ChannelName,
			Id:      uuid.NewString(),
		},
	}
}

func (c *ChannelClient) onConnectionError(err error) {
	c.subscription = nil
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
			c.subscription = &Identifier{
				Channel: msg.Identifier.Channel,
				Id:      msg.Identifier.Id,
			}
			log.Println("cable.ChannelClient#Connect: connected successfully:", *c.subscription)
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

func (c *ChannelClient) SendAction(msg CustomActionData) error {
	if c.subscription == nil {
		// We can't send actions without a subscription
		return errors.SentinelWithStack(ErrNotSubscribed)
	}
	c.cli.Sender() <- ClientMessage{
		Identifier: c.subscription,
		Command:    Message,
		ActionData: &msg,
	}
	return nil
}

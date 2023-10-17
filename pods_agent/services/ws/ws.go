package ws

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/go-monitor/pkg/sentry"
	"github.com/gorilla/websocket"
)

// ConnectionErrorCallback is called after an unexpected error in the connection.
// Any error treatment,  such as falling back to another connection method should be handled here.
type ConnectionErrorCallback func(err error)

// ConnectionCallback is called after the client successfully connects/reconnects to the server.
// Run any setup log, such as subscribing to topics, here
type ConnectedCallback func()

type MessageType int

const (
	TextMessage   MessageType = websocket.TextMessage
	BinaryMessage MessageType = websocket.BinaryMessage
)

type ReceivedMessage struct {
	Data        []byte
	MessageType MessageType
}

// Client is a Websocket client, that auto reconnects whenever an error occurs
// ParameterType T is the struct that can Unmarshal a message from the server
type Client struct {
	url               string
	header            http.Header
	conn              *websocket.Conn
	wCh               chan any
	rCh               chan ReceivedMessage
	errCh             chan error
	dialer            *websocket.Dialer
	backoff           BackOff
	cancel            context.CancelFunc
	pingWait          time.Duration
	onConnectionError ConnectionErrorCallback
	onConnected       func(*Client)
}

func New(url string, header http.Header, options ...Option) *Client {
	c := &Client{
		url:      url,
		header:   header,
		wCh:      make(chan any),
		rCh:      make(chan ReceivedMessage, 10),
		errCh:    make(chan error),
		dialer:   &websocket.Dialer{},
		backoff:  NewExponentialBackOff(time.Duration(time.Millisecond*500), time.Duration(time.Second*15), 2.0),
		pingWait: time.Second * 5,
	}
	for _, opt := range options {
		opt(c)
	}
	return c
}

func (c *Client) connectAndListen(ctx context.Context) error {
	innerCtx, cancel := context.WithCancel(ctx)
	defer cancel()
	conn, _, err := c.dialer.DialContext(ctx, c.url, c.header)
	if err != nil {
		return errors.Wrap(err, "dialer failed").WithMetadata(errors.Metadata{"url": c.url, "headers": c.header})
	}
	defer conn.Close()
	c.conn = conn

	// Writer Goroutine Loop
	writerStopped := make(chan struct{})
	go func() {
		defer close(writerStopped)
		defer sentry.NotifyIfPanic()
		for {
			select {
			case <-innerCtx.Done():
				return
			case msg := <-c.wCh:
				err := conn.WriteJSON(msg)
				if err != nil {
					if !websocket.IsCloseError(err) {
						log.Println(errors.Wrap(err, "WriteJSON failed"))
					} else {
						log.Println(errors.Wrap(err, "server closed connection"))
					}
					return
				}
			}
		}

	}()

	// Reader GoRoutine Loop
	readerStopped := make(chan struct{})
	go func() {
		defer close(readerStopped)
		defer sentry.NotifyIfPanic()
		for {
			mType, data, err := conn.ReadMessage()
			if err != nil {
				if !websocket.IsCloseError(err, websocket.CloseNormalClosure) {
					log.Println(errors.Wrap(err, "ReadJSON failed"))
				} else {
					log.Println(errors.Wrap(err, "server closed connection"))
				}
				return
			}
			c.rCh <- ReceivedMessage{Data: data, MessageType: MessageType(mType)}
		}
	}()

	if c.onConnected != nil {
		c.onConnected(c)
	}
	c.backoff.Reset()

	for {
		select {
		case <-readerStopped:
			return nil
		case <-writerStopped:
			return nil
		case <-ctx.Done():
			err := conn.WriteControl(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""), time.Now().Add(c.pingWait))
			if err != nil {
				log.Println("ws.Client#connectAndListen WriteMessage:", err)
				return nil
			}
			// Wait server to respond with closing the connection or leave after 2 seconds
			select {
			case <-readerStopped:
			case <-time.After(time.Second * 2):
			}
			return nil
		}
	}
}

// Sender channel, where any message to the server is sent
func (c *Client) Sender() chan<- any {
	return c.wCh
}

// Receiver channel where any message from the server is sent
func (c *Client) Receiver() <-chan ReceivedMessage {
	return c.rCh
}

// Close the connection. If you need to connect again, start a new instance of this structure
func (c *Client) Close() error {
	c.cancel()
	return nil
}

// Connect starts the websocket connection and handles reconnects when the connection closes unexpectedly
func (c *Client) Connect() error {
	ctx, cancel := context.WithCancel(context.Background())
	c.cancel = cancel
	go func() {
		defer close(c.rCh)
		defer close(c.wCh)
		defer sentry.NotifyIfPanic()

		// Run immediately and retries infinitely in case of errors
		// this call is blocking, it only leaves in case of error or context is closed
		err := c.connectAndListen(ctx)
		if err != nil {
			err = errors.Wrap(err, "websocket connection failed")
			if c.onConnectionError != nil {
				c.onConnectionError(err)
			}
			log.Println(err)
			log.Println("Waiting until retrying to connect...")
		}
		for {
			select {
			case <-ctx.Done():
				return
			case <-c.backoff.Next():
				log.Println("Retrying...")
				err := c.connectAndListen(ctx)
				if err != nil {
					err = errors.Wrap(err, "websocket connection failed")
					if c.onConnectionError != nil {
						c.onConnectionError(err)
					}
					log.Println(err)
					log.Println("Waiting until retrying to connect...")
				}
			}
		}
	}()
	return nil
}

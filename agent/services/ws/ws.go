package ws

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

// ConnectionErrorCallback is called after an unexpected error in the connection.
// Any error treatment,  such as falling back to another connection method should be handled here.
type ConnectionErrorCallback func(err error)

// ConnectionCallback is called after the client successfully connects/reconnects to the server.
// Run any setup log, such as subscribing to topics, here
type ConnectedCallback func()

// Client is a Websocket client, that auto reconnects whenever an error occurs
// ParameterType T is the struct that can Unmarshal a message from the server
type Client[T any] struct {
	url               string
	header            http.Header
	conn              *websocket.Conn
	wCh               chan any
	rCh               chan T
	errCh             chan error
	dialer            *websocket.Dialer
	backoff           BackOff
	cancel            context.CancelFunc
	pingWait          time.Duration
	onConnectionError ConnectionErrorCallback
	onConnected       func(*Client[T])
}

func New[T any](url string, header http.Header, options ...Option[T]) *Client[T] {
	c := &Client[T]{
		url:      url,
		header:   header,
		wCh:      make(chan any),
		rCh:      make(chan T, 10),
		errCh:    make(chan error),
		dialer:   &websocket.Dialer{},
		backoff:  NewExponentialBackOff(time.Millisecond*500, time.Second*15, 2.0),
		pingWait: time.Second * 5,
	}
	for _, opt := range options {
		opt(c)
	}
	return c
}

func (c *Client[T]) connectAndListen(ctx context.Context) error {
	innerCtx, cancel := context.WithCancel(ctx)
	defer cancel()
	conn, _, err := c.dialer.DialContext(ctx, c.url, c.header)
	if err != nil {
		return err
	}
	defer conn.Close()
	c.conn = conn

	// Writer Goroutine Loop
	writerStopped := make(chan struct{})
	go func() {
		defer close(writerStopped)
		for {
			select {
			case <-innerCtx.Done():
				return
			case msg := <-c.wCh:
				err := conn.WriteJSON(msg)
				if err != nil {
					if !websocket.IsCloseError(err) {
						log.Println("ws.Client#connectAndListen WriteJSON:", err)
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
		for {
			obj := new(T)
			err := conn.ReadJSON(obj)
			if err != nil {
				if !websocket.IsCloseError(err, websocket.CloseNormalClosure) {
					log.Println("ws.Client#connectAndListen ReadJSON:", err)
				}
				return
			}
			c.rCh <- *obj
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
func (c *Client[T]) Sender() chan<- any {
	return c.wCh
}

// Receiver channel where any message from the server is sent
func (c *Client[T]) Receiver() <-chan T {
	return c.rCh
}

// Close the connection. If you need to connect again, start a new instance of this structure
func (c *Client[T]) Close() error {
	c.cancel()
	return nil
}

// Connect starts the websocket connection and handles reconnects when the connection closes unexpectedly
func (c *Client[T]) Connect() error {
	ctx, cancel := context.WithCancel(context.Background())
	c.cancel = cancel
	go func() {
		defer close(c.rCh)
		defer close(c.wCh)

		// Run immediately and retries infinitely in case of errors
		// this call is blocking, it only leaves in case of error or context is closed
		err := c.connectAndListen(ctx)
		if err != nil {
			if c.onConnectionError != nil {
				c.onConnectionError(err)
			}
			log.Printf("ws.Client#Connect: Connection failed with error: %v\n", err)
			log.Println("Waiting until retrying to connect...")
		}
		for {
			select {
			case <-ctx.Done():
				return
			case <-c.backoff.Next():
				err := c.connectAndListen(ctx)
				if err != nil {
					if c.onConnectionError != nil {
						c.onConnectionError(err)
					}
					log.Printf("ws.Client#Connect: Connection failed with error: %v\n", err)
					log.Println("Waiting until retrying to connect...")
				}
			}
		}
	}()
	return nil
}

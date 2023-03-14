package ws

import "time"

type Option func(c *Client)

func WithPingTimeout(t time.Duration) Option {
	return func(c *Client) {
		c.pingWait = t
	}
}

func WithOnConnected(callback func(cli *Client)) Option {
	return func(c *Client) {
		c.onConnected = callback
	}
}

func WithConnectionErrorCallback(callback ConnectionErrorCallback) Option {
	return func(c *Client) {
		c.onConnectionError = callback
	}
}

func WithBackOff(backoff BackOff) Option {
	return func(c *Client) {
		c.backoff = backoff
	}
}

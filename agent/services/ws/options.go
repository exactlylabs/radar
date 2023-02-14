package ws

import "time"

type Option[T any] func(c *Client[T])

func WithPingTimeout[T any](t time.Duration) Option[T] {
	return func(c *Client[T]) {
		c.pingWait = t
	}
}

func WithOnConnected[T any](callback func(cli *Client[T])) Option[T] {
	return func(c *Client[T]) {
		c.onConnected = callback
	}
}

func WithConnectionErrorCallback[T any](callback ConnectionErrorCallback) Option[T] {
	return func(c *Client[T]) {
		c.onConnectionError = callback
	}
}

func WithBackOff[T any](backoff BackOff) Option[T] {
	return func(c *Client[T]) {
		c.backoff = backoff
	}
}

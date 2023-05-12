package tracing

import (
	"context"
	"errors"
	"math/rand"
	"net"
	"net/http"
	"time"
)

func newEnsureTransport() *ensureTransport {
	return &ensureTransport{
		RoundTripper: http.DefaultTransport,
	}
}

// ensureTransport is an HTTPTransport that retries with an exponential backoff failed requests if they failed during Dialing,
// which means that there was an issue with the connection, not with the server.
type ensureTransport struct {
	http.RoundTripper
}

func (t *ensureTransport) ensureIsSent(req *http.Request) {
	b := &backoff{
		initial:    1 * time.Second,
		maximum:    60 * time.Second,
		multiplier: 2,
		Rand:       rand.New(rand.NewSource(time.Now().Unix())),
	}

	_, err := t.RoundTripper.RoundTrip(req.Clone(context.Background()))
	for err != nil {
		<-b.Next()
		_, err = t.RoundTripper.RoundTrip(req.Clone(context.Background()))
	}
}

func (t *ensureTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	resp, err := t.RoundTripper.RoundTrip(req)
	var netErr *net.OpError
	if errors.As(err, &netErr) && netErr.Op == "dial" {
		go t.ensureIsSent(req)
	}
	return resp, err
}

// exponential backoff
type backoff struct {
	initial    time.Duration
	maximum    time.Duration
	current    time.Duration
	multiplier float32
	Rand       *rand.Rand
}

func (b *backoff) Next() <-chan time.Time {
	next := b.current
	if next == 0 {
		next = b.initial
	} else {
		next = time.Duration(float32(b.current) * b.multiplier)
	}
	if next > b.maximum {
		next = b.maximum
	}
	b.current = next
	// now add a randomness +-10%
	next = time.Duration(float32(next) * (0.9 + b.Rand.Float32()*0.2))
	return time.After(next)
}

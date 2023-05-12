package tracing

import (
	"context"
	"math/rand"
	"net/http"
	"time"
)

func newEnsureTransport() *ensureTransport {
	return &ensureTransport{
		RoundTripper: http.DefaultTransport,
	}
}

// ensureTransport is an HTTPTransport that keeps trying to send a request until it is successful
// no response is returned to the caller besides an empty 202 Accepted.
// Sentry doesn't care for responses, so there's no problem with this
type ensureTransport struct {
	http.RoundTripper
}

func (at *ensureTransport) ensureIsSent(req *http.Request) {
	b := &backoff{
		initial:    1 * time.Second,
		maximum:    60 * time.Second,
		multiplier: 2,
		Rand:       rand.New(rand.NewSource(time.Now().Unix())),
	}

	_, err := at.RoundTripper.RoundTrip(req.Clone(context.Background()))
	for err != nil {
		<-b.Next()
		_, err = at.RoundTripper.RoundTrip(req.Clone(context.Background()))
	}
}

func (at *ensureTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	go at.ensureIsSent(req)
	resp := &http.Response{
		StatusCode: http.StatusAccepted,
	}
	return resp, nil
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

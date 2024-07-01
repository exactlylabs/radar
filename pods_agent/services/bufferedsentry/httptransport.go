package bufferedsentry

/*
* Note for the Reader:
* All errors in this transporter are puporsefully being logged only, since this is the transporter
* for sentry and if it fails, there's nowhere to notify. Additionally, we don't want this to break the application in any way.
 */

import (
	"bytes"
	"encoding/base64"
	"io"
	"log"
	"net"
	"net/http"
	"time"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/getsentry/sentry-go"
)

type Queue interface {
	Push([]byte) error
	Pop() ([]byte, error)
	Shrink() error
}

func newBufferedTransport(queue Queue, dsnStr string) *bufferedTransport {
	dsn, err := sentry.NewDsn(dsnStr)
	if err != nil {
		log.Println(errors.Wrap(err, "failed to parse dsn %s", dsn))
		dsn = nil
	}
	t := &bufferedTransport{
		RoundTripper: http.DefaultTransport,
		retryCh:      make(chan *http.Request, 100),
		loopClosed:   make(chan any),
		memBuffer:    make([][]byte, 0),
		dsn:          dsn,
		queue:        queue,
	}
	go t.bufferLoop()
	return t
}

// bufferedTransport is an HTTPTransport that adds to a buffer in disk all requests that have failed due to a connection error
type bufferedTransport struct {
	http.RoundTripper
	bufferDir  string
	retryCh    chan *http.Request
	loopClosed chan any
	memBuffer  [][]byte // base64 encoded request bodies
	dsn        *sentry.Dsn
	queue      Queue
}

func (t *bufferedTransport) bufferLoop() {
	timer := time.NewTicker(60 * time.Second)
	defer close(t.loopClosed)
	// Receiver Loop adds requests to the buffer
	for {
		select {
		case req, ok := <-t.retryCh:
			if !ok {
				// Channel Closed
				return
			}
			data, err := io.ReadAll(req.Body)
			if err != nil {
				log.Println(errors.W(err))
				continue
			}
			buf := bytes.NewBuffer(nil)
			if _, err := base64.NewEncoder(base64.StdEncoding, buf).Write(data); err != nil {
				log.Println(errors.W(err))
				continue
			}
			t.queue.Push(buf.Bytes())

		case <-timer.C:
			t.retry()
			t.queue.Shrink()
		}
	}
}

// retry to send the events stored in disk and keep those that still failed due to connection error
func (t *bufferedTransport) retry() {

	toRetry := make([][]byte, 0)
	for data, err := t.queue.Pop(); len(data) > 0 || err != nil; data, err = t.queue.Pop() {
		err := t.sendBody(data)
		if t.shouldRetry(err) {
			log.Println(errors.W(err))
			// Add to a variable instead of directly pushing back to the Queue, otherwise we end up in an infinite loop
			// of Pop'ing what we just pushed
			toRetry = append(toRetry, data)
		}
	}

	for _, data := range toRetry {
		t.queue.Push(data)
	}
}

func (t *bufferedTransport) sendBody(body []byte) error {
	decodedBody := base64.NewDecoder(base64.StdEncoding, bytes.NewReader(body))
	req, err := http.NewRequest(http.MethodPost, t.dsn.GetAPIURL().String(), decodedBody)
	if err != nil {
		return errors.W(err)
	}
	for k, v := range t.dsn.RequestHeaders() {
		req.Header.Set(k, v)
	}
	_, err = t.RoundTripper.RoundTrip(req)
	return errors.W(err)
}

func (t *bufferedTransport) shouldRetry(err error) bool {
	var netErr *net.OpError
	return errors.As(err, &netErr) && netErr.Op == "dial"
}

func (t *bufferedTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	resp, err := t.RoundTripper.RoundTrip(req)
	if t.shouldRetry(err) {
		t.retryCh <- req
	}
	return resp, err
}

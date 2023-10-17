package bufferedsentry

/*
* Note for the Reader:
* All errors in this transporter are puporsefully being logged only, since this is the transporter
* for sentry and if it fails, there's nowhere to notify. Additionally, we don't want this to break the application in any way.
 */

import (
	"bufio"
	"bytes"
	"encoding/base64"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/getsentry/sentry-go"
)

const bufferName = "tracing_buffer"

func newBufferedTransport(bufferDir string, dsnStr string) *bufferedTransport {
	dsn, err := sentry.NewDsn(dsnStr)
	if err != nil {
		log.Println(errors.Wrap(err, "failed to parse dsn %s", dsn))
		dsn = nil
	}
	t := &bufferedTransport{
		RoundTripper: http.DefaultTransport,
		bufferDir:    bufferDir,
		retryCh:      make(chan *http.Request, 100),
		loopClosed:   make(chan any),
		memBuffer:    make([][]byte, 0),
		dsn:          dsn,
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
			t.storeInMemory(req)
		case <-timer.C:
			t.storeInDisk(t.memBuffer)
			t.memBuffer = t.memBuffer[:0]
			t.retry()
		}
	}
}

func (t *bufferedTransport) storeInMemory(req *http.Request) {
	if len(t.memBuffer) == 100 {
		t.storeInDisk(t.memBuffer)
		t.memBuffer = t.memBuffer[:0]
	}
	data, err := io.ReadAll(req.Body)
	if err != nil {
		log.Println(fmt.Errorf("tracing.ensureTransport#storeInMemory ReadAll: %w", err))
		return
	}
	buff := bytes.NewBuffer(nil)
	_, err = base64.NewEncoder(base64.StdEncoding, buff).Write(data)
	if err != nil {
		log.Println(fmt.Errorf("tracing.ensureTransport#storeInMemory Write: %w", err))
		return
	}
	t.memBuffer = append(t.memBuffer, buff.Bytes())
}

func (t *bufferedTransport) storeInDisk(events [][]byte) {

	// Remove len(buffer) oldest entries if file is too big, before appending new entries
	if fInfo, err := os.Stat(filepath.Join(t.bufferDir, bufferName)); err == nil && fInfo.Size() > 10*1024*1024 { // 10MB
		oldData := bytes.NewBuffer(nil)
		f, err := os.Open(filepath.Join(t.bufferDir, bufferName))
		if err != nil {
			log.Println(fmt.Errorf("tracing.ensureTransport#storeInDisk Open: %w", err))
			return
		}
		scanner := bufio.NewScanner(f)
		i := 0
		for scanner.Scan() {
			i++
			if i < len(events) {
				continue
			}
			oldData.Write(scanner.Bytes())
			oldData.Write([]byte("\n"))
		}
		f.Close()
		os.WriteFile(filepath.Join(t.bufferDir, bufferName), oldData.Bytes(), 0644)
	}

	f, err := os.OpenFile(filepath.Join(t.bufferDir, bufferName), os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Println(fmt.Errorf("tracing.ensureTransport#storeInDisk OpenFile: %w", err))
		return
	}
	defer f.Close()
	for _, evt := range events {
		_, err := f.Write(evt)
		if err != nil {
			log.Println(fmt.Errorf("tracing.ensureTransport#storeInBuffer Write: %w", err))
			continue
		}
		f.Write([]byte("\n"))
	}
}

// retry to send the events stored in disk and keep those that still failed due to connection error
func (t *bufferedTransport) retry() {
	f, err := os.Open(filepath.Join(t.bufferDir, bufferName))
	if err != nil {
		if !os.IsNotExist(err) {
			log.Println(fmt.Errorf("tracing.ensureTransport#retry Open: %w", err))
		}
		return
	}
	defer f.Close()
	// tmpF stores the requests that failed to be sent in this retry
	tmpF, err := os.OpenFile(filepath.Join(t.bufferDir, bufferName+".tmp"), os.O_TRUNC|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Println(fmt.Errorf("tracing.ensureTransport#retry OpenFile: %w", err))
		return
	}
	defer tmpF.Close()

	// Try o send what's in the buffer file and add to the tmp buffer file what fails
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		bodyBytes := scanner.Bytes()
		err := t.sendBody(bodyBytes)
		if err != nil {
			tmpF.Write(bodyBytes)
			tmpF.Write([]byte("\n"))
		}
	}
	os.Rename(filepath.Join(t.bufferDir, bufferName+".tmp"), filepath.Join(t.bufferDir, bufferName))
}

func (t *bufferedTransport) sendBody(body []byte) error {
	decodedBody := base64.NewDecoder(base64.StdEncoding, bytes.NewReader(body))
	req, err := http.NewRequest(http.MethodPost, t.dsn.GetAPIURL().String(), decodedBody)
	if err != nil {
		log.Println(fmt.Errorf("tracing.ensureTransport#retry ReadRequest: %w", err))
		return err
	}
	for k, v := range t.dsn.RequestHeaders() {
		req.Header.Set(k, v)
	}
	_, err = t.RoundTripper.RoundTrip(req)
	return err
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

func (t *bufferedTransport) Flush() {
	close(t.retryCh)
	<-t.loopClosed
	if len(t.memBuffer) > 0 {
		t.storeInDisk(t.memBuffer)
	}
}

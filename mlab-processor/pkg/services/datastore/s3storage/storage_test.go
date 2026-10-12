package s3storage

import (
	"context"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/aws/aws-sdk-go/service/s3"
)

func TestIsNotFound(t *testing.T) {
	cases := []struct {
		err  error
		want bool
	}{
		{awserr.NewRequestFailure(awserr.New("NotFound", "Not Found", nil), 404, "r"), true},
		{awserr.NewRequestFailure(awserr.New("NoSuchKey", "", nil), 404, "r"), true},
		{awserr.New("NotFound", "", nil), true},
		{awserr.NewRequestFailure(awserr.New("InternalError", "", nil), 500, "r"), false},
		{awserr.NewRequestFailure(awserr.New("Forbidden", "", nil), 403, "r"), false},
		{awserr.NewRequestFailure(awserr.New("ServiceUnavailable", "", nil), 503, "r"), false},
		{awserr.New("RequestError", "send request failed", errors.New("dial tcp: i/o timeout")), false},
		{errors.New("context deadline exceeded"), false},
	}
	for _, c := range cases {
		if got := isNotFound(c.err); got != c.want {
			t.Errorf("isNotFound(%v) = %v, want %v", c.err, got, c.want)
		}
	}
}

func newTestStorage(t *testing.T, h http.HandlerFunc) *s3Storage {
	srv := httptest.NewServer(h)
	t.Cleanup(srv.Close)
	st, err := New(S3StorageOptions{BucketName: "b", AccessKey: "k", SecretKey: "s", Endpoint: srv.URL, Region: "us-east-005"})
	if err != nil {
		t.Fatal(err)
	}
	s := st.(*s3Storage)
	// no SDK-internal retries (they back off for seconds); test our own retry loop
	s.awsSession.Config.MaxRetries = aws.Int(0)
	s.cli = s3.New(s.awsSession)
	s.uploader = NewUploader("b", s.awsSession)
	s.uploader.backoff = time.Millisecond
	return s
}

func TestStoreSeeksToStartOnEveryAttempt(t *testing.T) {
	var mu sync.Mutex
	var bodies []string
	calls := 0
	s := newTestStorage(t, func(w http.ResponseWriter, r *http.Request) {
		b, _ := io.ReadAll(r.Body)
		mu.Lock()
		defer mu.Unlock()
		calls++
		bodies = append(bodies, string(b))
		if calls <= 2 { // fail the first two attempts
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		w.Header().Set("ETag", `"x"`)
	})
	content := strings.Repeat("0123456789", 1000)
	r := strings.NewReader(content)
	io.Copy(io.Discard, r) // reader at EOF, as after a failed attempt
	if err := s.Store(context.Background(), r, "fetch/2026-07-31.avro"); err != nil {
		t.Fatal(err)
	}
	if last := bodies[len(bodies)-1]; last != content {
		t.Fatalf("stored %d bytes, want %d", len(last), len(content))
	}
}

func TestStoreReturnsErrorAfterAttempts(t *testing.T) {
	s := newTestStorage(t, func(w http.ResponseWriter, r *http.Request) {
		io.ReadAll(r.Body)
		w.WriteHeader(http.StatusInternalServerError)
	})
	s.uploader.attempts = 2
	if err := s.Store(context.Background(), strings.NewReader("x"), "k"); err == nil {
		t.Fatal("expected an error")
	}
}

func TestExistsOnlyNotFoundIsFalse(t *testing.T) {
	existsBackoff = time.Millisecond
	status := http.StatusNotFound
	s := newTestStorage(t, func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(status)
	})
	if ok, err := s.Exists(context.Background(), "k"); ok || err != nil {
		t.Fatalf("404: got %v %v", ok, err)
	}
	status = http.StatusOK
	if ok, err := s.Exists(context.Background(), "k"); !ok || err != nil {
		t.Fatalf("200: got %v %v", ok, err)
	}
	for _, st := range []int{http.StatusInternalServerError, http.StatusForbidden, http.StatusServiceUnavailable} {
		status = st
		if ok, err := s.Exists(context.Background(), "k"); ok || err == nil {
			t.Fatalf("%d: got %v %v, want an error", st, ok, err)
		}
	}
}

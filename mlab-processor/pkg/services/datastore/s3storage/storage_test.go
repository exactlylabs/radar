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
)

func newTestStorage(t *testing.T, h http.HandlerFunc) *s3Storage {
	srv := httptest.NewServer(h)
	t.Cleanup(srv.Close)
	opts := S3StorageOptions{BucketName: "b", AccessKey: "k", SecretKey: "s", Endpoint: srv.URL, Region: "us-east-005"}
	st, err := New(opts)
	if err != nil {
		t.Fatal(err)
	}
	s := st.(*s3Storage)
	// no SDK-internal retries (they back off for seconds); test our own retry loop
	s.cli = newClient(opts, 1)
	s.backoff, s.existsBackoff = time.Millisecond, time.Millisecond
	return s
}

func TestIsNotFound(t *testing.T) {
	if isNotFound(errors.New("context deadline exceeded")) {
		t.Fatal("plain error is not a 404")
	}
}

func TestEndpointURL(t *testing.T) {
	for in, want := range map[string]string{
		"s3.us-east-005.backblazeb2.com":         "https://s3.us-east-005.backblazeb2.com",
		"https://s3.us-east-005.backblazeb2.com": "https://s3.us-east-005.backblazeb2.com",
		"http://127.0.0.1:9000":                  "http://127.0.0.1:9000",
	} {
		if got := endpointURL(in); got != want {
			t.Errorf("%s: %s", in, got)
		}
	}
}

func TestStoreSeeksToStartOnEveryAttempt(t *testing.T) {
	var mu sync.Mutex
	var bodies []string
	calls := 0
	s := newTestStorage(t, func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPut || r.URL.Path != "/b/fetch/2026-07-31.avro" {
			t.Errorf("unexpected %s %s", r.Method, r.URL.Path)
		}
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
	if calls != 3 {
		t.Fatalf("calls %d", calls)
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
	s.attempts = 2
	if err := s.Store(context.Background(), strings.NewReader("x"), "k"); err == nil {
		t.Fatal("expected an error")
	}
}

func TestExistsOnlyNotFoundIsFalse(t *testing.T) {
	var mu sync.Mutex
	status := http.StatusNotFound
	s := newTestStorage(t, func(w http.ResponseWriter, r *http.Request) {
		mu.Lock()
		defer mu.Unlock()
		w.WriteHeader(status)
	})
	set := func(v int) { mu.Lock(); status = v; mu.Unlock() }
	if ok, err := s.Exists(context.Background(), "k"); ok || err != nil {
		t.Fatalf("404: got %v %v", ok, err)
	}
	set(http.StatusOK)
	if ok, err := s.Exists(context.Background(), "k"); !ok || err != nil {
		t.Fatalf("200: got %v %v", ok, err)
	}
	for _, st := range []int{http.StatusInternalServerError, http.StatusForbidden, http.StatusServiceUnavailable} {
		set(st)
		if ok, err := s.Exists(context.Background(), "k"); ok || err == nil {
			t.Fatalf("%d: got %v %v, want an error", st, ok, err)
		}
	}
}

func TestGetMissingIsErrNotExist(t *testing.T) {
	s := newTestStorage(t, func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
		io.WriteString(w, `<?xml version="1.0"?><Error><Code>NoSuchKey</Code><Message>x</Message></Error>`)
	})
	if _, err := s.Get(context.Background(), "k"); err == nil || !strings.Contains(err.Error(), "not exist") {
		t.Fatalf("got %v", err)
	}
}

package s3storage

import (
	"bytes"
	"context"
	"io"
	"net"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"sync/atomic"
	"testing"
)

// A server that cuts the first full download of an object short, then serves Range requests.
func TestReadResumesACutDownload(t *testing.T) {
	content := bytes.Repeat([]byte("0123456789abcdef"), 4096) // 64 KiB
	var gets int32
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		if req.Method != http.MethodGet || !strings.HasSuffix(req.URL.Path, "/files/x.avro") {
			w.WriteHeader(404)
			return
		}
		atomic.AddInt32(&gets, 1)
		if rg := req.Header.Get("Range"); rg != "" {
			from, _ := strconv.Atoi(strings.TrimSuffix(strings.TrimPrefix(rg, "bytes="), "-"))
			w.Header().Set("Content-Length", strconv.Itoa(len(content)-from))
			w.WriteHeader(206)
			w.Write(content[from:])
			return
		}
		w.Header().Set("Content-Length", strconv.Itoa(len(content)))
		w.WriteHeader(200)
		w.Write(content[:20000])
		w.(http.Flusher).Flush()
		// Cut the connection: the client sees an unexpected EOF.
		conn, _, err := w.(http.Hijacker).Hijack()
		if err != nil {
			t.Error(err)
			return
		}
		conn.(*net.TCPConn).SetLinger(0)
		conn.Close()
	}))
	defer srv.Close()
	st, err := New("bucket", "key", "secret", srv.URL, "us-east-005")
	if err != nil {
		t.Fatal(err)
	}
	r, err := st.Read(context.Background(), "files/x.avro")
	if err != nil {
		t.Fatal(err)
	}
	defer r.Close()
	got, err := io.ReadAll(r)
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Equal(got, content) {
		t.Fatalf("read %d bytes, want %d", len(got), len(content))
	}
	if g := atomic.LoadInt32(&gets); g < 2 {
		t.Fatalf("%d GET requests, the cut download should have been resumed", g)
	}
}

package s3storage

import (
	"bytes"
	"context"
	"encoding/xml"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"testing"
)

// multipartServer is the subset of the S3 multipart API the storage uses.
type multipartServer struct {
	mu        sync.Mutex
	parts     map[int][]byte
	attempts  map[int]int
	failPart  func(n, attempt int) bool
	completed []int
	aborted   bool
	singlePut bool
}

func (m *multipartServer) handle(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	m.mu.Lock()
	defer m.mu.Unlock()
	switch {
	case r.Method == http.MethodPost && q.Has("uploads"):
		io.WriteString(w, `<?xml version="1.0" encoding="UTF-8"?><InitiateMultipartUploadResult><Bucket>b</Bucket><Key>k</Key><UploadId>u1</UploadId></InitiateMultipartUploadResult>`)
	case r.Method == http.MethodPut && q.Has("partNumber"):
		if q.Get("uploadId") != "u1" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		n, _ := strconv.Atoi(q.Get("partNumber"))
		body, _ := io.ReadAll(r.Body)
		m.attempts[n]++
		if m.failPart != nil && m.failPart(n, m.attempts[n]) {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		m.parts[n] = body
		w.Header().Set("ETag", fmt.Sprintf(`"etag-%d"`, n))
	case r.Method == http.MethodPost && q.Get("uploadId") == "u1":
		var req struct {
			Parts []struct {
				PartNumber int    `xml:"PartNumber"`
				ETag       string `xml:"ETag"`
			} `xml:"Part"`
		}
		body, _ := io.ReadAll(r.Body)
		if err := xml.Unmarshal(body, &req); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		for _, p := range req.Parts {
			if p.ETag != fmt.Sprintf(`"etag-%d"`, p.PartNumber) {
				w.WriteHeader(http.StatusBadRequest)
				return
			}
			m.completed = append(m.completed, p.PartNumber)
		}
		io.WriteString(w, `<?xml version="1.0" encoding="UTF-8"?><CompleteMultipartUploadResult><Bucket>b</Bucket><Key>k</Key><ETag>"all"</ETag></CompleteMultipartUploadResult>`)
	case r.Method == http.MethodDelete && q.Get("uploadId") == "u1":
		m.aborted = true
		w.WriteHeader(http.StatusNoContent)
	case r.Method == http.MethodPut:
		m.singlePut = true
		io.ReadAll(r.Body)
		w.Header().Set("ETag", `"x"`)
	default:
		w.WriteHeader(http.StatusBadRequest)
	}
}

func newMultipartStorage(t *testing.T) (*s3Storage, *multipartServer) {
	m := &multipartServer{parts: map[int][]byte{}, attempts: map[int]int{}}
	s := newTestStorage(t, m.handle)
	s.multipartThreshold = 1000
	s.partSize = 1000
	s.concurrency = 3
	return s, m
}

func TestStoreMultipartReassembles(t *testing.T) {
	s, m := newMultipartStorage(t)
	// part 2 fails once: it is retried from its start, the others are unaffected
	m.failPart = func(n, attempt int) bool { return n == 2 && attempt == 1 }
	content := []byte(strings.Repeat("0123456789", 350)) // 3500 bytes: 4 parts
	if err := s.Store(context.Background(), bytes.NewReader(content), "ipgeocode/2026-07-31.avro"); err != nil {
		t.Fatal(err)
	}
	if m.singlePut {
		t.Fatal("expected a multipart upload")
	}
	var got []byte
	for n := 1; n <= 4; n++ {
		got = append(got, m.parts[n]...)
	}
	if !bytes.Equal(got, content) || len(m.parts) != 4 {
		t.Fatalf("stored %d bytes in %d parts", len(got), len(m.parts))
	}
	if m.attempts[2] != 2 || m.attempts[1] != 1 {
		t.Fatalf("attempts %v", m.attempts)
	}
	if fmt.Sprint(m.completed) != "[1 2 3 4]" {
		t.Fatalf("completed %v", m.completed)
	}
	if m.aborted {
		t.Fatal("aborted")
	}
}

func TestStoreMultipartAbortsWhenAPartKeepsFailing(t *testing.T) {
	s, m := newMultipartStorage(t)
	s.attempts = 2
	m.failPart = func(n, attempt int) bool { return n == 3 }
	content := bytes.Repeat([]byte("x"), 3500)
	err := s.Store(context.Background(), bytes.NewReader(content), "k")
	if err == nil || !strings.Contains(err.Error(), "part 3") {
		t.Fatalf("got %v", err)
	}
	if !m.aborted || len(m.completed) > 0 {
		t.Fatalf("aborted=%v completed=%v", m.aborted, m.completed)
	}
	if m.attempts[3] != 2 {
		t.Fatalf("part 3 attempts %d", m.attempts[3])
	}
}

func TestStoreSmallObjectsUseOnePut(t *testing.T) {
	s, m := newMultipartStorage(t)
	if err := s.Store(context.Background(), bytes.NewReader([]byte("small")), "k"); err != nil {
		t.Fatal(err)
	}
	if !m.singlePut || len(m.parts) != 0 {
		t.Fatal("expected a single PUT")
	}
}

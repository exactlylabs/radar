package fetcher

import (
	"context"
	"crypto/tls"
	"fmt"
	"io"
	"net/http"
	"time"

	gcpstorage "cloud.google.com/go/storage"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

const mlabBucket = "archive-measurement-lab"

// ObjectSource is the M-Lab archive (a GCS bucket), abstracted for tests.
type ObjectSource interface {
	// List returns all object names under prefix. A partial listing must be an error.
	List(ctx context.Context, prefix string) ([]string, error)
	// Open returns a reader for the object; the caller closes it.
	Open(ctx context.Context, path string) (io.ReadCloser, error)
}

type gcsSource struct {
	client *gcpstorage.Client
	bucket string
}

// NewMLabSource returns an anonymous client for M-Lab's public archive bucket.
//
// The client gets its own HTTP/1.1 transport. With the default transport, Go's HTTP/2
// multiplexes every concurrent download onto one TCP connection (GCS allows 100 streams
// per connection), and one stream at Google's RTT tops out around 50 MB/s no matter how
// many download workers there are. With HTTP/2 off, every in-flight download is its own
// connection and the aggregate rate scales with the download pool; the idle pool is large
// so the connections stay warm between tarballs.
func NewMLabSource(ctx context.Context) (ObjectSource, io.Closer, error) {
	transport := http.DefaultTransport.(*http.Transport).Clone()
	transport.ForceAttemptHTTP2 = false
	transport.Protocols = new(http.Protocols)
	transport.Protocols.SetHTTP1(true)
	transport.TLSClientConfig = &tls.Config{NextProtos: []string{"http/1.1"}} // never negotiate h2 over ALPN
	transport.TLSNextProto = map[string]func(string, *tls.Conn) http.RoundTripper{}
	transport.MaxConnsPerHost = 0
	transport.MaxIdleConns = 0
	transport.MaxIdleConnsPerHost = 256
	transport.IdleConnTimeout = 90 * time.Second
	client, err := gcpstorage.NewClient(ctx, option.WithoutAuthentication(), option.WithHTTPClient(&http.Client{Transport: transport}))
	if err != nil {
		return nil, nil, fmt.Errorf("fetcher.NewMLabSource: %w", err)
	}
	return &gcsSource{client: client, bucket: mlabBucket}, closers{client, closerFunc(transport.CloseIdleConnections)}, nil
}

type closerFunc func()

func (f closerFunc) Close() error { f(); return nil }

type closers []io.Closer

func (c closers) Close() error {
	var first error
	for _, cl := range c {
		if err := cl.Close(); err != nil && first == nil {
			first = err
		}
	}
	return first
}

func (g *gcsSource) List(ctx context.Context, prefix string) ([]string, error) {
	return g.ListRange(ctx, prefix, "", "")
}

// ListRange lists the objects under prefix whose names are in [start, end) (an empty
// bound is unbounded).
func (g *gcsSource) ListRange(ctx context.Context, prefix, start, end string) ([]string, error) {
	var names []string
	it := g.client.Bucket(g.bucket).Objects(ctx, &gcpstorage.Query{Prefix: prefix, StartOffset: start, EndOffset: end})
	for {
		attrs, err := it.Next()
		if err == iterator.Done {
			return names, nil
		}
		if err != nil {
			return nil, err
		}
		names = append(names, attrs.Name)
	}
}

// sizedReader is an object reader that knows the object's size, which lets the fetch
// reserve its memory before downloading it.
type sizedReader struct {
	io.ReadCloser
	size int64
}

func (s sizedReader) Size() int64 { return s.size }

func (g *gcsSource) Open(ctx context.Context, path string) (io.ReadCloser, error) {
	r, err := g.client.Bucket(g.bucket).Object(path).NewReader(ctx)
	if err != nil {
		return nil, err
	}
	return sizedReader{r, r.Attrs.Size}, nil
}

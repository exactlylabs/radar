package bufferedsentry

import (
	"net/http"

	sentry "github.com/exactlylabs/go-monitor/pkg/sentry"
	_sentry "github.com/getsentry/sentry-go"
)

// customTransport is a wrapper around sentry's HTTPTransport that allows us to flush the buffer
type customTransport struct {
	*_sentry.HTTPTransport
	roundTripper http.RoundTripper
}

func newCustomSentryTranport(queue Queue, dsn string) _sentry.Transport {
	return &customTransport{
		HTTPTransport: _sentry.NewHTTPTransport(),
		roundTripper:  newBufferedTransport(queue, dsn),
	}
}

func (t *customTransport) Configure(opts sentry.ClientOptions) {
	// Replace the default round tripper that is private to our own
	opts.HTTPTransport = t.roundTripper
	t.HTTPTransport.Configure(opts)
}

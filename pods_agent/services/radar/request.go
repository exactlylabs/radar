package radar

import (
	"io"
	"net/http"

	"github.com/exactlylabs/go-errors/pkg/errors"
)

func NewRequest(method, url string, body io.Reader) (*http.Request, error) {
	req, err := http.NewRequest(method, url, body)
	if err != nil {
		return nil, errors.Wrap(err, "http.NewRequest failed").WithMetadata(errors.Metadata{"method": method, "url": url})
	}
	req.Header.Add("Accept", "application/json")
	return req, nil
}

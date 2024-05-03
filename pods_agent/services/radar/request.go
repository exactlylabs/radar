package radar

import (
	"encoding/base64"
	"fmt"
	"io"
	"net/http"

	"github.com/exactlylabs/go-errors/pkg/errors"
)

func NewRequest(method, url, clientId, clientSecret string, body io.Reader) (*http.Request, error) {
	req, err := http.NewRequest(method, url, body)
	if err != nil {
		return nil, errors.Wrap(err, "http.NewRequest failed").WithMetadata(errors.Metadata{"method": method, "url": url})
	}
	req.Header.Add("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")

	if clientId != "" && clientSecret != "" {
		token := base64.StdEncoding.EncodeToString([]byte(fmt.Sprintf("%s:%s", clientId, clientSecret)))
		req.Header.Set("Authorization", fmt.Sprintf("ClientToken %s", token))
	}

	return req, nil
}

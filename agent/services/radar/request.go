package radar

import (
	"fmt"
	"io"
	"net/http"
)

func NewRequest(method, url string, body io.Reader) (*http.Request, error) {
	req, err := http.NewRequest("POST", url, body)
	if err != nil {
		return nil, fmt.Errorf("radar.NewRequest NewRequest: %w", err)
	}
	req.Header.Add("Accept", "application/json")
	return req, nil
}

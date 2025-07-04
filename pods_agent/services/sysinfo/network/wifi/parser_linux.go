package wifi

import (
	"bytes"
	"encoding/csv"
	"strings"

	"github.com/exactlylabs/go-errors/pkg/errors"
)

func parseNetwork(b []byte) ([]network, error) {
	i := bytes.Index(b, []byte("\n"))
	if i > 0 {
		b = b[i:]
	}
	r := csv.NewReader(bytes.NewReader(b))
	r.Comma = '\t'
	r.FieldsPerRecord = 4

	recs, err := r.ReadAll()
	if err != nil {
		return nil, errors.W(err).WithMetadata(errors.Metadata{"networks_response": string(b)})
	}

	nts := []network{}
	for _, rec := range recs {
		if rec[0] == "" || rec[0] == "FAIL" {
			rec[0] = rec[1]
		}
		nts = append(nts, network{
			ID:         rec[0],
			SSID:       rec[1],
			BSSID:      rec[2],
			Flags:      parseFlags(rec[3]),
			Registered: true,
		})
	}

	return nts, nil
}

func parseFlags(s string) []string {
	s = strings.TrimPrefix(s, "[")
	s = strings.TrimSuffix(s, "]")

	flags := strings.Split(s, "][")
	if len(flags) == 1 && flags[0] == "" {
		return []string{}
	}

	return flags
}

func parseStatus(data string) (s WifiStatus) {
	s.Status = "INACTIVE"
	for _, l := range strings.Split(data, "\n") {
		bits := strings.Split(strings.TrimSpace(l), "=")
		if len(bits) < 2 {
			continue
		}

		switch bits[0] {
		case "bssid":
			s.BSSID = bits[1]
		case "ssid":
			s.SSID = bits[1]
		case "wpa_state":
			s.Status = bits[1]
		case "ip_address":
			s.IP = bits[1]
		}
	}
	return
}

func quote(s string) string {
	if s == "" {
		return s
	}
	return `"` + s + `"`
}

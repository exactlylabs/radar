package wifi

import (
	"bytes"
	"encoding/csv"
	"strings"
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
		return nil, err
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

package asnmap

import (
	"bufio"
	"encoding/json"
	"errors"
	"fmt"
	"io"
)

var (
	ErrASNNotFound    = errors.New("ASN not found")
	ErrMissingOrg     = errors.New("organization_id not found")
	ErrNotInitialized = errors.New("this package was not initialized")
)

type Organization struct {
	Id   string
	Name string
}

type ASN struct {
	Asn          string
	Organization *Organization
}

// Maps organization information by org_id
var organizations map[string]*Organization

// Maps ASN values to an organization id
var asns map[string]*ASN

var loaded = false

// LoadCAIDAJsonl opens a .jsonl file and parse it, loading the contents in memory
func LoadCAIDAJsonl(file io.Reader) error {
	organizations = make(map[string]*Organization)
	asns = make(map[string]*ASN)
	scanner := bufio.NewScanner(file)
	i := 0
	for scanner.Scan() {
		row := make(map[string]string)
		rowData := scanner.Bytes()
		if len(rowData) == 0 {
			continue
		}
		if err := json.Unmarshal(rowData, &row); err != nil {
			return fmt.Errorf("asnmap.LoadData error unmarshalling row %d: %w", i, err)
		}

		// First, we have organizations mapping
		switch row["type"] {
		case "Organization":
			organizations[row["organizationId"]] = &Organization{
				Id:   row["organizationId"],
				Name: row["name"],
			}
		case "ASN":
			org, exists := organizations[row["organizationId"]]
			if !exists {
				return ErrMissingOrg
			}
			asns[row["asn"]] = &ASN{
				Asn:          row["asn"],
				Organization: org,
			}
		}
		i++
	}
	loaded = true
	return nil
}

// Lookup an ASN object from an asn id
func Lookup(asn string) (*ASN, error) {
	if !loaded {
		return nil, ErrNotInitialized
	}
	if asnObj, exists := asns[asn]; exists {
		return asnObj, nil
	}
	return nil, ErrASNNotFound
}

package asnmap

import (
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

// Maps ASN values to their Obj
var asns map[string]*ASN

// Maps ASN names to their Obj
var asnNamesMap map[string]*ASN

var loaded = false

// LoadCAIDAJsonl opens a .jsonl file and parse it, loading the contents in memory
func LoadCAIDAJsonl(file io.Reader) error {
	organizations = make(map[string]*Organization)
	asns = make(map[string]*ASN)
	asnNamesMap = make(map[string]*ASN)
	decoder := json.NewDecoder(file)
	i := 0
	for decoder.More() {
		row := make(map[string]string)
		if err := decoder.Decode(&row); err != nil {
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
			obj := &ASN{
				Asn:          row["asn"],
				Organization: org,
			}
			asns[row["asn"]] = obj
			asnNamesMap[row["name"]] = obj
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

// Lookup an ASN object by its Name value
func LookupByName(asnName string) (*ASN, error) {
	if !loaded {
		return nil, ErrNotInitialized
	}
	if asnObj, exists := asnNamesMap[asnName]; exists {
		return asnObj, nil
	}
	return nil, ErrASNNotFound
}

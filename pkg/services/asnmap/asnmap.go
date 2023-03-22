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

type ASNMapper struct {
	organizations map[string]*Organization
	asns          map[string]*ASN
	asnNamesMap   map[string]*ASN
}

func New(file io.Reader) (*ASNMapper, error) {
	am := &ASNMapper{}
	err := am.loadCAIDAJsonl(file)
	if err != nil {
		return nil, fmt.Errorf("asnmap.New loadCAIDAJsonl: %w", err)
	}
	return am, nil
}

// LoadCAIDAJsonl opens a .jsonl file and parse it, loading the contents in memory
func (am *ASNMapper) loadCAIDAJsonl(file io.Reader) error {
	am.organizations = make(map[string]*Organization)
	am.asns = make(map[string]*ASN)
	am.asnNamesMap = make(map[string]*ASN)
	decoder := json.NewDecoder(file)
	i := 0
	for decoder.More() {
		row := make(map[string]string)
		if err := decoder.Decode(&row); err != nil {
			return fmt.Errorf("asnmap.ASNMapper#loadCAIDAJsonl Decode #%d: %w", i, err)
		}

		// First, we have organizations mapping
		switch row["type"] {
		case "Organization":
			am.organizations[row["organizationId"]] = &Organization{
				Id:   row["organizationId"],
				Name: row["name"],
			}
		case "ASN":
			org, exists := am.organizations[row["organizationId"]]
			if !exists {
				return ErrMissingOrg
			}
			obj := &ASN{
				Asn:          row["asn"],
				Organization: org,
			}
			am.asns[row["asn"]] = obj
			am.asnNamesMap[row["name"]] = obj
		}
		i++
	}
	return nil
}

// Lookup an ASN object from an asn id
func (am *ASNMapper) Lookup(asn string) (*ASN, error) {
	if asnObj, exists := am.asns[asn]; exists {
		return asnObj, nil
	}
	return nil, ErrASNNotFound
}

// Lookup an ASN object by its Name value
func (am *ASNMapper) LookupByName(asnName string) (*ASN, error) {
	if asnObj, exists := am.asnNamesMap[asnName]; exists {
		return asnObj, nil
	}
	return nil, ErrASNNotFound
}

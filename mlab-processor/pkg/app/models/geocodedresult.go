package models

import (
	_ "embed"
)

//go:embed geocodedresult.avsc
var GeocodedResultSchema string

type GeocodedResult struct {
	Id        string   `avro:"id"`
	TestStyle string   `avro:"test_style"`
	IP        string   `avro:"ip"`
	StartedAt int64    `avro:"started_at"`
	Upload    bool     `avro:"upload"`
	MBPS      float32  `avro:"mbps"`
	LossRate  *float32 `avro:"loss_rate"`
	MinRTT    *float32 `avro:"min_rtt"`

	Latitude           float64 `avro:"latitude"`
	Longitude          float64 `avro:"longitude"`
	LocationAccuracyKM float64 `avro:"location_accuracy_km"`

	ASN            int     `avro:"asn"`
	ASNOrg         string  `avro:"asn_org"`
	ASNOrgId       *string `avro:"asn_org_id"`
	HasAccessToken bool    `avro:"has_access_token"`
	AccessTokenSig *string `avro:"access_token_sig"`
}

package models

import (
	_ "embed"
)

//go:embed geocodedresult.avsc
var GeocodedResultSchema string

type GeocodedResult struct {
	Id        string   `parquet:"name=id, type=BYTE_ARRAY, convertedtype=UTF8" avro:"id"`
	TestStyle string   `parquet:"name=test_style, type=BYTE_ARRAY, convertedtype=UTF8" avro:"test_style"`
	IP        string   `parquet:"name=ip, type=BYTE_ARRAY, convertedtype=UTF8" avro:"ip"`
	StartedAt int64    `parquet:"name=started_at, type=INT64" avro:"started_at"`
	Upload    bool     `parquet:"name=upload, type=BOOLEAN" avro:"upload"`
	MBPS      float32  `parquet:"name=mbps, type=FLOAT" avro:"mbps"`
	LossRate  *float32 `parquet:"name=loss_rate, type=FLOAT" avro:"loss_rate"`
	MinRTT    *float32 `parquet:"name=min_rtt, type=FLOAT" avro:"min_rtt"`

	Latitude           float64 `parquet:"name=latitude, type=FLOAT" avro:"latitude"`
	Longitude          float64 `parquet:"name=longitude, type=FLOAT" avro:"longitude"`
	LocationAccuracyKM float64 `parquet:"name=location_accuracy_km, type=FLOAT" avro:"location_accuracy_km"`

	ASN    int    `parquet:"name=asn, type=INT32" avro:"asn"`
	ASNOrg string `parquet:"name=asn_org, type=BYTE_ARRAY, convertedtype=UTF8" avro:"asn_org"`

	HasAccessToken bool    `parquet:"name=has_access_token, type=BOOLEAN" avro:"has_access_token"`
	AccessTokenSig *string `parquet:"name=access_token_sig, type=BYTE_ARRAY, convertedtype=UTF8" avro:"access_token_sig"`
}

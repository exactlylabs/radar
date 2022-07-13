package models

import (
	_ "embed"
)

//go:embed fetchedresult.avsc
var FetchedResultSchema string

type FetchedResult struct {
	Id             string   `parquet:"name=id, type=BYTE_ARRAY, convertedtype=UTF8" avro:"id"`
	TestStyle      string   `parquet:"name=test_style, type=BYTE_ARRAY, convertedtype=UTF8" avro:"test_style"`
	IP             string   `parquet:"name=ip, type=BYTE_ARRAY, convertedtype=UTF8" avro:"ip"`
	StartedAt      int64    `parquet:"name=started_at, type=INT64" avro:"started_at"`
	Upload         bool     `parquet:"name=upload, type=BOOLEAN" avro:"upload"`
	MBPS           float32  `parquet:"name=mbps, type=FLOAT" avro:"mbps"`
	LossRate       *float32 `parquet:"name=loss_rate, type=FLOAT" avro:"loss_rate"`
	MinRTT         *float32 `parquet:"name=min_rtt, type=FLOAT" avro:"min_rtt"`
	HasAccessToken bool     `parquet:"name=has_access_token, type=BOOLEAN" avro:"has_access_token"`
	AccessTokenSig *string  `parquet:"name=access_token_sig, type=BYTE_ARRAY, convertedtype=UTF8" avro:"access_token_sig"`
}

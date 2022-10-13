package models

import (
	_ "embed"
)

//go:embed fetchedresult.avsc
var FetchedResultSchema string

type FetchedResult struct {
	Id             string   `avro:"id"`
	TestStyle      string   `avro:"test_style"`
	IP             string   `avro:"ip"`
	StartedAt      int64    `avro:"started_at"`
	Upload         bool     `avro:"upload"`
	MBPS           float32  `avro:"mbps"`
	LossRate       *float32 `avro:"loss_rate"`
	MinRTT         *float32 `avro:"min_rtt"`
	HasAccessToken bool     `avro:"has_access_token"`
	AccessTokenSig *string  `avro:"access_token_sig"`
}

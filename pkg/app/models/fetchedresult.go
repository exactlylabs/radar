package models

type FetchedResult struct {
	Id             string   `parquet:"name=id, type=BYTE_ARRAY, convertedtype=UTF8"`
	TestStyle      string   `parquet:"name=test_style, type=BYTE_ARRAY, convertedtype=UTF8"`
	IP             string   `parquet:"name=ip, type=BYTE_ARRAY, convertedtype=UTF8"`
	StartedAt      int64    `parquet:"name=started_at, type=INT64"`
	Upload         bool     `parquet:"name=upload, type=BOOLEAN"`
	MBPS           float32  `parquet:"name=mbps, type=FLOAT"`
	LossRate       *float32 `parquet:"name=loss_rate, type=FLOAT"`
	MinRTT         *float32 `parquet:"name=min_rtt, type=FLOAT"`
	AccessTokenSig *string  `parquet:"name=access_token_sig, type=BYTE_ARRAY, convertedtype=UTF8"`
}

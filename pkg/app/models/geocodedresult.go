package models

type GeocodedResult struct {
	Id        string   `parquet:"name=id, type=BYTE_ARRAY, convertedtype=UTF8"`
	TestStyle string   `parquet:"name=test_style, type=BYTE_ARRAY, convertedtype=UTF8"`
	IP        string   `parquet:"name=ip, type=BYTE_ARRAY, convertedtype=UTF8"`
	StartedAt int64    `parquet:"name=started_at, type=INT64"`
	Upload    bool     `parquet:"name=upload, type=BOOLEAN"`
	MBPS      float32  `parquet:"name=mbps, type=FLOAT"`
	LossRate  *float32 `parquet:"name=loss_rate, type=FLOAT"`
	MinRTT    *float32 `parquet:"name=min_rtt, type=FLOAT"`

	Latitude           float64 `parquet:"name=latitude, type=FLOAT"`
	Longitude          float64 `parquet:"name=longitude, type=FLOAT"`
	LocationAccuracyKM float64 `parquet:"name=location_accuracy_km, type=FLOAT"`

	ASN    int    `parquet:"name=asn, type=INT32"`
	ASNOrg string `parquet:"name=asn_org, type=BYTE_ARRAY, convertedtype=UTF8"`

	HasAccessToken bool    `parquet:"name=has_access_token, type=BOOLEAN"`
	AccessTokenSig *string `parquet:"name=access_token_sig, type=BYTE_ARRAY, convertedtype=UTF8"`
}

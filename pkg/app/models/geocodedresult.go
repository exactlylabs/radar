package models

type GeocodedResult struct {
	Id        string  `parquet:"name=id, type=BYTE_ARRAY"`
	IP        string  `parquet:"name=ip, type=BYTE_ARRAY"`
	StartedAt int64   `parquet:"name=started_at, type=INT64"`
	Upload    bool    `parquet:"name=upload, type=BOOLEAN"`
	MBPS      float32 `parquet:"name=mbps, type=FLOAT"`

	Latitude  float64 `parquet:"name=latitude, type=FLOAT"`
	Longitude float64 `parquet:"name=longitude, type=FLOAT"`
}

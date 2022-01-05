package models

type FetchedResult struct {
	Id        string  `parquet:"name=id, type=BYTE_ARRAY, convertedtype=UTF8"`
	IP        string  `parquet:"name=ip, type=BYTE_ARRAY, convertedtype=UTF8"`
	StartedAt int64   `parquet:"name=started_at, type=INT64"`
	Upload    bool    `parquet:"name=upload, type=BOOLEAN"`
	MBPS      float32 `parquet:"name=mbps, type=FLOAT"`
}

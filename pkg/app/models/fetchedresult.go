package models

type FetchedResult struct {
	Id        string  `parquet:"name=id, type=BYTE_ARRAY"`
	IPAddress string  `parquet:"name=ipaddress, type=BYTE_ARRAY"`
	Date      int64   `parquet:"name=date, type=INT64"`
	Direction string  `parquet:"name=direction, type=BYTE_ARRAY"`
	MBPS      float32 `parquet:"name=mbps, type=FLOAT"`
}

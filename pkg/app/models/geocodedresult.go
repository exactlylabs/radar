package models

type GeocodedResult struct {
	Id        string  `parquet:"name=id, type=BYTE_ARRAY"`
	IPAddress string  `parquet:"name=ipaddress, type=BYTE_ARRAY"`
	Date      int64   `parquet:"name=date, type=INT64"`
	Direction string  `parquet:"name=direction, type=BYTE_ARRAY"`
	MBPS      float32 `parquet:"name=mbps, type=FLOAT"`

	Latitude  float64 `parquet:"name=lat, type=FLOAT"`
	Longitude float64 `parquet:"name=lng, type=FLOAT"`
}

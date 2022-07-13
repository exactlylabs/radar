package models

import (
	_ "embed"
)

//go:embed revgeoresult.avsc
var RevGeoResultSchema string

type RevGeoResult struct {
	GeoNamespace string `parquet:"name=geo_namespace, type=BYTE_ARRAY, convertedtype=UTF8" avro:"geo_namespace"`
	Id           string `parquet:"name=id, type=BYTE_ARRAY, convertedtype=UTF8" avro:"id"`
	GeoId        string `parquet:"name=geo_id, type=BYTE_ARRAY, convertedtype=UTF8" avro:"geo_id"`
	StartedAt    int64  `avro:"started_at"`
}

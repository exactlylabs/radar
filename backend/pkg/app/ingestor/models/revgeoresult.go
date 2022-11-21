package models

type RevGeoResult struct {
	GeoNamespace string `avro:"geo_namespace"`
	Id           string `avro:"id"`
	GeoId        string `avro:"geo_id"`
	StartedAt    int64  `avro:"started_at"`
}

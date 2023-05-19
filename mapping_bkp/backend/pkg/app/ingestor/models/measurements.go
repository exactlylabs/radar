package models

type Measurements struct {
	IPGeocodeResult
	GeoId        string `avro:"geo_id"`
	GeoNamespace string `avro:"geo_namespace"`
}

package models

type RevGeoResult struct {
	GeoNamespace string `parquet:"name=geo_namespace, type=BYTE_ARRAY"`
	Id           string `parquet:"name=id, type=BYTE_ARRAY"`
	GeoId        string `parquet:"name=geo_id, type=BYTE_ARRAY"`
}

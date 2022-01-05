package models

type RevGeoResult struct {
	GeoNamespace string `parquet:"name=geo_namespace, type=BYTE_ARRAY, convertedtype=UTF8"`
	Id           string `parquet:"name=id, type=BYTE_ARRAY, convertedtype=UTF8"`
	GeoId        string `parquet:"name=geo_id, type=BYTE_ARRAY, convertedtype=UTF8"`
}

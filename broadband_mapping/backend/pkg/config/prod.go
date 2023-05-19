package config

import (
	"fmt"
	"runtime"
)

var ProdConfig = &Config{
	Environment:               "PROD",
	DBUser:                    "",
	DBPassword:                "",
	DBHost:                    "",
	DBPortStr:                 "",
	FilesBucketName:           "mlab-processed-data",
	ClickhouseStorageNWorkers: fmt.Sprintf("%d", runtime.NumCPU()),
	UseCacheStr:               "true",
	StatesGeoJSONFile:         "geos/states.geojson",
	CountiesGeoJSONFile:       "geos/counties.geojson",
	TribalTractsGeoJSONFile:   "geos/tribal_tracts.geojson",
	StatesMBTilesFile:         "geos/states.mbtiles",
	CountiesMBTilesFile:       "geos/counties.mbtiles",
	TribalTractsMBTilesFile:   "geos/tribal_tracts.mbtiles",
	MultiLayeredMBTilesFile:   "geos/multi_layer.mbtiles",
	StatesLayerName:           "states",
	CountiesLayerName:         "counties",
	TribalTractsLayerName:     "tribal_tracts",
}

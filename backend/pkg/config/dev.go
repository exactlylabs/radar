package config

import (
	"fmt"
	"runtime"
)

var DevConfig = &Config{
	DBName:                    "default",
	DBUser:                    "default",
	DBPassword:                "",
	DBHost:                    "localhost",
	DBPortStr:                 "9001",
	FilesBucketName:           "mlab-processed-data",
	CORSAllowedOrigins:        "*",
	ClickhouseStorageNWorkers: fmt.Sprintf("%d", runtime.NumCPU()),
	UseCacheStr:               "false",
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

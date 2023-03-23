/*
Set up shapes for the following Namespaces
  - US_STATE
  - US_COUNTIES
  - US_TRIBAL_TRACTS
  - MULTI_LAYERED

The shapes are in .geojson and .mbtiles formats. Additionally, this binary inserts the Features of these shapes into the DB as Geospace objects
*/
package main

import (
	"flag"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"strconv"

	"github.com/exactlylabs/mlab-mapping/backend/cmd/setup_shapes/internal"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/adapters/clickhousestorages"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/namespaces"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/config"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/clickhousedb"
	"github.com/joho/godotenv"
)

var importOrder = []namespaces.Namespace{namespaces.US_STATE, namespaces.US_COUNTY, namespaces.US_TTRACT}
var shapeUrls = map[namespaces.Namespace]string{
	namespaces.US_STATE:  "https://www2.census.gov/geo/tiger/TIGER2021/STATE/tl_2021_us_state.zip",
	namespaces.US_COUNTY: "https://www2.census.gov/geo/tiger/TIGER2021/COUNTY/tl_2021_us_county.zip",
	namespaces.US_TTRACT: "https://www.sciencebase.gov/catalog/file/get/4f4e4a2ee4b07f02db61576c?facet=Indian_Reservations",
}
var envName = flag.String("env-file", ".env", "Name of the environment variables file")
var outputDir = flag.String("output-dir", "geos", "Directory where all files will be stored")

func main() {
	flag.Parse()
	godotenv.Load(*envName)
	internal.ValidateRequiredBinary("tippecanoe")
	internal.ValidateRequiredBinary("ogr2ogr")
	internal.ValidateRequiredBinary("tile-join")
	conf := config.GetConfig()
	if err := os.MkdirAll(*outputDir, os.FileMode(0775)); err != nil {
		panic(err)
	}
	nWorkers := runtime.NumCPU()
	if conf.ClickhouseStorageNWorkers != "" {
		n, err := strconv.Atoi(conf.ClickhouseStorageNWorkers)
		if err != nil {
			panic(err)
		}
		nWorkers = n
	}
	db, err := clickhousedb.Open(clickhousedb.ChStorageOptions{
		DBName:         conf.DBName,
		Username:       conf.DBUser,
		Password:       conf.DBPassword,
		Host:           conf.DBHost,
		Port:           conf.DBPort(),
		MaxConnections: nWorkers,
	})
	if err != nil {
		panic(err)
	}
	defer db.Close()
	storage := clickhousestorages.NewGeospaceStorage(db)
	storage.Open()
	defer storage.Close()
	for _, ns := range importOrder {
		log.Println("Downloading files for Namespace", ns)
		shapeFile := shapePath(string(ns))
		geoJsonFile := geoJSONPath(string(ns))
		if err := internal.DownloadShapeFile(shapeFile, shapeUrls[ns]); err != nil {
			panic(err)
		}
		log.Println("Shapefile stored at", shapeFile)
		if err := internal.ShapeToGeoJSON(shapeFile, geoJsonFile, internal.DefaultSimplify); err != nil {
			panic(err)
		}
		log.Println("GeoJSON generated and stored at", geoJsonFile)
		fc, err := internal.LoadGeoJSON(geoJsonFile)
		if err != nil {
			panic(err)
		}
		log.Println("GeoJSON file loaded")
		geospaces, err := internal.PopulateDB(storage, ns, fc)
		if err != nil {
			panic(err)
		}
		log.Println("Imported", len(geospaces), ns)
		if err := internal.ReWriteGeoJSONFromGeospaces(geoJsonFile, fc, geospaces); err != nil {
			panic(err)
		}
		log.Println("GeoJSON re-written with Geospaces data")
	}

	//  Now, create the tilesets to each namespace
	stateGeoJSONPath := geoJSONPath(string(namespaces.US_STATE))
	stateMBTilesPath := mbtilesPath(string(namespaces.US_STATE))
	stateMBTilesMultiPath := mbtilesPath(string(namespaces.US_STATE) + "_MULTI")
	stateLayerName := string(namespaces.US_STATE)

	countyGeoJSONPath := geoJSONPath(string(namespaces.US_COUNTY))
	countyMBTilesPath := mbtilesPath(string(namespaces.US_COUNTY))
	countyMBTilesMultiPath := mbtilesPath(string(namespaces.US_COUNTY) + "_MULTI")
	countyLayerName := string(namespaces.US_COUNTY)

	ttractGeoJSONPath := geoJSONPath(string(namespaces.US_TTRACT))
	ttractMBTilesPath := mbtilesPath(string(namespaces.US_TTRACT))
	ttractLayerName := string(namespaces.US_TTRACT)

	// States zoom 0 to 12
	if err := internal.GeoJSONToTilesets(stateGeoJSONPath, stateMBTilesPath, stateLayerName, 0, 12); err != nil {
		panic(err)
	}
	// States zoom 0 to 5 to use by the MultiLayered
	if err := internal.GeoJSONToTilesets(stateGeoJSONPath, stateMBTilesMultiPath, stateLayerName, 0, 5); err != nil {
		panic(err)
	}
	// Counties zoom 0 to 12
	if err := internal.GeoJSONToTilesets(countyGeoJSONPath, countyMBTilesPath, countyLayerName, 0, 12); err != nil {
		panic(err)
	}
	// Counties zoom 6 to 12
	if err := internal.GeoJSONToTilesets(countyGeoJSONPath, countyMBTilesMultiPath, countyLayerName, 6, 12); err != nil {
		panic(err)
	}
	// Tribal Tracts zoom 0 to 12
	if err := internal.GeoJSONToTilesets(ttractGeoJSONPath, ttractMBTilesPath, ttractLayerName, 0, 12); err != nil {
		panic(err)
	}

	// Remove auxiliary files
	os.Remove(stateMBTilesMultiPath)
	os.Remove(countyMBTilesMultiPath)
}

func geoJSONPath(filename string) string {
	return filepath.Join(*outputDir, filename+".geojson")
}

func shapePath(filename string) string {
	return filepath.Join(*outputDir, filename+".zip")
}

func mbtilesPath(filename string) string {
	return filepath.Join(*outputDir, filename+".mbtiles")
}

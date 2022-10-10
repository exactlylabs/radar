/*
This binary will populate the US_STATE, US_COUNTIES and US_TRIBAL_TRACTS shape files

It fills geospace table with the FIPs codes, Display names and other informations
*/
package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"runtime"
	"strconv"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/adapters/clickhousestorage"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/config"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/ingestor/ports"
	"github.com/joho/godotenv"
	"github.com/twpayne/go-geom/encoding/geojson"
)

var files = map[string]string{
	"US_COUNTIES":      "./geos/US_COUNTIES.geojson",
	"US_STATES":        "./geos/US_STATES.geojson",
	"US_TRIBAL_TRACTS": "./geos/Indian_Reservations.geojson",
}

var codesMap = map[string][]string{
	"US_COUNTIES":      {"GEOID", "NAME"},
	"US_STATES":        {"GEOID", "NAME"},
	"US_TRIBAL_TRACTS": {"ORG_CODE", "IND_NAME"},
}

var importOrder = []string{"US_STATES", "US_COUNTIES", "US_TRIBAL_TRACTS"}

func main() {
	godotenv.Load()
	conf := config.GetConfig()
	flag.Parse()
	nWorkers := runtime.NumCPU()
	if conf.ClickhouseStorageNWorkers != "" {
		n, err := strconv.Atoi(conf.ClickhouseStorageNWorkers)
		if err != nil {
			panic(err)
		}
		nWorkers = n
	}
	storage := clickhousestorage.New(&clickhouse.Options{
		Auth: clickhouse.Auth{
			Database: conf.DBName,
			Username: conf.DBUser,
			Password: conf.DBPassword,
		},
		Addr:         []string{fmt.Sprintf("%s:%s", conf.DBHost, conf.DBPort)},
		MaxOpenConns: nWorkers + 5,
	}, nWorkers, false, false)
	storage.Begin()
	defer storage.Close()
	for _, ns := range importOrder {
		filePath := files[ns]
		fc := geojson.FeatureCollection{}
		f, err := os.Open(filePath)
		if err != nil {
			panic(err)
		}
		data, err := ioutil.ReadAll(f)
		if err != nil {
			panic(err)
		}
		if err := fc.UnmarshalJSON(data); err != nil {
			panic(err)
		}
		f.Close()
		i := 0
		for _, feature := range fc.Features {
			i++
			codeMap := codesMap[ns]
			rawCode := feature.Properties[codeMap[0]]
			if rawCode == nil {
				log.Println(ns, "shape with no data... skipping it")
				continue
			}
			code := rawCode.(string)
			rawName := feature.Properties[codeMap[1]]
			if rawName == nil {
				log.Println(ns, "shape with no data... skipping it")
				continue
			}
			name := rawName.(string)
			switch ns {
			case "US_STATES":
				g := &ports.Geospace{
					Name:      &name,
					GeoId:     code,
					Namespace: "US_STATES",
				}
				if err := storage.SaveGeospace(g); err != nil {
					panic(err)
				}
			case "US_COUNTIES":
				stateFips := code[:2]
				parent, err := storage.GetGeospaceByGeoId("US_STATES", stateFips)
				if err != nil {
					panic(err)
				}
				g := &ports.Geospace{
					Namespace: "US_COUNTIES",
					Name:      &name,
					GeoId:     code,
				}
				if parent != nil {
					g.ParentId = &parent.Id
				}
				if err := storage.SaveGeospace(g); err != nil {
					panic(err)
				}
			}
		}
		log.Println("Imported", i, ns)
	}
}

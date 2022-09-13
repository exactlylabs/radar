/*
This binary will populate the US_STATE, US_COUNTIES and US_CITIES FIPs Codes

It fills geospace table with the FIPs codes, Display names and other informations
*/
package main

import (
	"encoding/csv"
	"flag"
	"fmt"
	"io"
	"os"
	"runtime"
	"strconv"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/adapters/clickhousestorage"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/adapters/tsdbstorage"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/config"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/ingestor/ports"
	"github.com/joho/godotenv"
)

const (
	startingIndex = 5
	stateSummary  = "040"
	countySummary = "050"
)

var headers = map[string]int{
	"summary":     0,
	"state_fips":  1,
	"county_fips": 2,
	"name":        6,
}

// Obtainable at https://www.census.gov/geographies/reference-files/2021/demo/popest/2021-fips.html
// It comes as a .xlsx file, so convert it to a csv before calling this
var censusPath = flag.String("f", "", "Path to the Census file in csv format")

func main() {
	godotenv.Load()
	conf := config.GetConfig()
	flag.Parse()
	f, err := os.Open(*censusPath)
	if err != nil {
		panic(err)
	}
	var storage ports.MeasurementsStorage
	if os.Getenv("STORAGE_TYPE") == "tsdb" {
		storage = tsdbstorage.New(config.GetConfig().DBDSN(), 0)
	} else if os.Getenv("STORAGE_TYPE") == "clickhouse" {
		nWorkers := runtime.NumCPU()
		if conf.ClickhouseStorageNWorkers != "" {
			n, err := strconv.Atoi(conf.ClickhouseStorageNWorkers)
			if err != nil {
				panic(err)
			}
			nWorkers = n
		}
		storage = clickhousestorage.New(&clickhouse.Options{
			Auth: clickhouse.Auth{
				Database: conf.DBName,
				Username: conf.DBUser,
				Password: conf.DBPassword,
			},
			Addr:         []string{fmt.Sprintf("%s:%s", conf.DBHost, conf.DBPort)},
			MaxOpenConns: nWorkers + 5,
		}, nWorkers)
	}
	storage.Begin()
	defer storage.Close()

	reader := csv.NewReader(f)
	i := 0
	for {
		row, err := reader.Read()
		if err == io.EOF {
			break
		}

		if i < startingIndex {
			i++
			continue
		}
		switch row[headers["summary"]] {
		case countySummary:
			stateFips := row[headers["state_fips"]]
			parent, err := storage.GetGeospaceByGeoId("US_STATES", stateFips)
			if err != nil {
				panic(err)
			}
			countyFips := row[headers["county_fips"]]
			g := &ports.Geospace{
				Namespace: "US_COUNTIES",
				Name:      &row[headers["name"]],
				GeoId:     stateFips + countyFips,
			}
			if parent != nil {
				g.ParentId = &parent.Id
			}
			if err := storage.SaveGeospace(g); err != nil {
				panic(err)
			}
		case stateSummary:
			stateFips := row[headers["state_fips"]]
			g := &ports.Geospace{
				Namespace: "US_STATES",
				Name:      &row[headers["name"]],
				GeoId:     stateFips,
			}
			if err := storage.SaveGeospace(g); err != nil {
				panic(err)
			}
		}

	}
}

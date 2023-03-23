package main

import (
	"context"
	"flag"
	"log"
	"os"
	"os/signal"
	"runtime"
	"sync"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/adapters/clickhousestorages"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/adapters/geoprovider"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/geo"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/namespaces"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/webapi"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/config"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/clickhousedb"
	"github.com/joho/godotenv"
)

var addr = flag.String("addr", "localhost:5000", "http service bind address")
var envName = flag.String("env-file", ".env", "Name of the environment variables file")

func main() {
	flag.Parse()
	godotenv.Load(*envName)
	done := make(chan bool, 1)
	signals := make(chan os.Signal, 1)
	signal.Notify(signals, os.Interrupt)
	go func() {
		i := 0
		for range signals {
			log.Println("Received INT signal")
			if i > 0 {
				log.Println("Forcing Shutdown. Bye :(")
				os.Exit(0)
			}
			done <- true
			i++
			log.Println("Send an INT signal again if you wish to force shutdown")
		}
	}()
	conf := config.GetConfig()
	db, err := clickhousedb.Open(clickhousedb.ChStorageOptions{
		DBName:         conf.DBName,
		Username:       conf.DBUser,
		Password:       conf.DBPassword,
		Host:           conf.DBHost,
		Port:           conf.DBPort(),
		MaxConnections: runtime.NumCPU() + 5,
	})
	if err != nil {
		panic(errors.Wrap(err, "DB Open error"))
	}
	defer db.Close()
	log.Println("Starting Mlab-Mapping Server")
	geoJSONServers := &geo.GeoJSONServers{
		States:       geoprovider.NewGeoJSONServer(conf, namespaces.US_STATE),
		Counties:     geoprovider.NewGeoJSONServer(conf, namespaces.US_COUNTY),
		TribalTracts: geoprovider.NewGeoJSONServer(conf, namespaces.US_TTRACT),
	}
	tilesetServers := &geo.TilesetServers{
		States:       geoprovider.NewTilesetServer(conf, namespaces.US_STATE),
		Counties:     geoprovider.NewTilesetServer(conf, namespaces.US_COUNTY),
		TribalTracts: geoprovider.NewTilesetServer(conf, namespaces.US_TTRACT),
	}
	storages := &storages.MappingAppStorages{
		GeospacesStorage: clickhousestorages.NewGeospaceStorage(db),
		ASNOrgsStorage:   clickhousestorages.NewASNOrgStorage(db),
		SummariesStorage: clickhousestorages.NewSummariesStorage(db),
	}
	server := webapi.NewMappingAPI(config.GetConfig(), storages, geoJSONServers, tilesetServers)

	wg := &sync.WaitGroup{}
	wg.Add(1)
	go func() {
		defer wg.Done()
		if err := server.Run(*addr); err != nil {
			panic(errors.Wrap(err, "Run error"))
		}
	}()
	log.Println("Finished Starting all applications. Send an INT signal to shutdown.")
	<-done
	log.Println("Shutdown Requested. Finishing all tasks")
	server.Shutdown(context.Background())
	wg.Wait()
	log.Println("Graceful Shutdown completed. Bye :)")
}

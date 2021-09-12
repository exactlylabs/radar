package main

import (
	"flag"
	"log"
	"math/rand"
	"os"
	"os/signal"
	"time"

	"github.com/exactlylabs/radar/server/pkg/app/model"
	"github.com/exactlylabs/radar/server/pkg/app/web"
)

var addr = flag.String("addr", "localhost:5000", "http service address")

func main() {
	flag.Parse()

	log.Println("Welcome to the Radar Server.")

	rand.Seed(time.Now().UnixNano())

	done := make(chan bool, 1)
	signals := make(chan os.Signal, 1)
	signal.Notify(signals, os.Interrupt)
	go func() {
		for range signals {
			log.Println("Received INT signal")
			done <- true
		}
	}()

	model.AutoMigrate()

	webService := web.NewWebService()
	webService.Run(*addr)

	log.Printf("We're up and running at '%v'!\n", *addr)

	<-done

	log.Println("Shutting down safely!")

	webService.Shutdown()

	log.Println("All is well. Shutdown complete, goodbye!")
}

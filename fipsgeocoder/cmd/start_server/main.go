/*
FIPs Geocoder API

Simple webservice that returns a countie fips code based on lat/long
*/
package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"

	"github.com/exactlylabs/radar/fipsgeocoder/pkg/handlers"
)

func main() {
	addr := flag.String("bind", "0.0.0.0", "Address to listen to requests")
	port := flag.Int64("port", 5000, "Port to listen to requests")
	flag.Parse()

	listen := fmt.Sprintf("%s:%d", *addr, *port)
	mux := http.NewServeMux()
	mux.HandleFunc("/api/v1/fips", handlers.GeocodeHandler)

	log.Printf("Starting FIPS Geocoder Service at %s\n", listen)
	http.ListenAndServe(listen, mux)
}

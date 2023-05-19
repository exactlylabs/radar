package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/exactlylabs/radar/pods_agent/internal/update"
)

func main() {
	binPath := flag.String("bin", "", "Path to the binary we will sign")
	outPath := flag.String("o", "", "path to store the parsed binary")
	flag.Parse()

	if *binPath == "" || *outPath == "" {
		fmt.Println("-o and -bin are required arguments")
		flag.PrintDefaults()
		os.Exit(1)
	}
	signedBin, err := os.Open(*binPath)
	if err != nil {
		panic(err)
	}
	originalBinary, err := update.ParseUpdateFile(signedBin)
	if err != nil {
		panic(err)
	}
	f, err := os.OpenFile(*outPath, os.O_WRONLY|os.O_CREATE, 0755)
	if err != nil {
		panic(err)
	}
	f.Write(originalBinary)
	f.Close()
	fmt.Println("Finished storing the validated binary")
}

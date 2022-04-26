package ookla

import (
	_ "embed"
	"fmt"
	"os"
)

//go:embed ookla.exe
var ooklaBinary []byte

const (
	binaryPath = "./ookla.exe"
)

// createOoklaBinary generates the embeded
// executable for running the speedtest
func createOoklaBinary() {
	binary := ooklaBinary
	f, err := os.OpenFile(binaryPath, os.O_WRONLY|os.O_CREATE, 0755)
	if err != nil {
		panic(fmt.Errorf("setup.validateOoklaBinary error opening bin file: %w", err))
	}
	f.Write(binary)
	f.Close()
}

func init() {
	createOoklaBinary()
}

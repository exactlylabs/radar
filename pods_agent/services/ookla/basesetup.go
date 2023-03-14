package ookla

import (
	"fmt"
	"os"

	"github.com/exactlylabs/radar/pods_agent/config"
)

// createOoklaBinary generates the embeded
// executable for running the speedtest
func createOoklaBinary() {
	binary := ooklaBinary
	f, err := config.OpenFile(binaryFilename, os.O_WRONLY|os.O_CREATE, 0755)
	if err != nil {
		panic(fmt.Errorf("setup.validateOoklaBinary error opening bin file: %w", err))
	}
	f.Write(binary)
	f.Close()
}

func binaryPath() string {
	return config.Join(binaryFilename)
}

func init() {
	createOoklaBinary()
}

package ookla

import (
	"os"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/radar/pods_agent/config"
)

// createOoklaBinary generates the embeded
// executable for running the speedtest
func createOoklaBinary() {
	binary := ooklaBinary
	f, err := config.OpenFile(binaryFilename, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0755)
	if err != nil {
		panic(errors.Wrap(err, "error opening bin file"))
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

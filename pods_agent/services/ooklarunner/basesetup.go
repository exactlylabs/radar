package ookla

import (
	"os"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/radar/pods_agent/config"
)

// createOoklaBinary generates the embeded
// executable for running the speedtest
func createOoklaBinary() error {
	binary := ooklaBinary
	f, err := config.OpenFile(binaryFilename, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0755)
	if err != nil {
		return errors.W(err)
	}
	if _, err := f.Write(binary); err != nil {
		return errors.W(err)
	}
	f.Close()
	return nil
}

func binaryPath() string {
	return config.Join(binaryFilename)
}

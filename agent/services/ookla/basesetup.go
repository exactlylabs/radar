package ookla

import (
	"fmt"
	"os"
	"path/filepath"
)

func confDir() string {
	d, err := os.UserConfigDir()
	if err != nil {
		return ""
	}
	return filepath.Join(d, "ookla")
}

// createOoklaBinary generates the embeded
// executable for running the speedtest
func createOoklaBinary() {
	binary := ooklaBinary
	path := filepath.Join(confDir(), binaryFilename)
	f, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE, 0755)
	if err != nil {
		panic(fmt.Errorf("setup.validateOoklaBinary error opening bin file: %w", err))
	}
	f.Write(binary)
	f.Close()
}

func binaryPath() string {
	return filepath.Join(confDir(), binaryFilename)
}

func init() {
	createOoklaBinary()
}

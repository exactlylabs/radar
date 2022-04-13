package ookla

import (
	"fmt"
	"os"
)

const (
	binaryPath = "./ookla"
)

// createOoklaBinary generates the embeded
// executable for running the speedtest
func createOoklaBinary() {
	if _, err := os.ReadFile(binaryPath); os.IsNotExist(err) {
		binary := ooklaBinary
		f, err := os.OpenFile(binaryPath, os.O_WRONLY|os.O_CREATE, 0755)
		if err != nil {
			panic(fmt.Errorf("setup.validateOoklaBinary error opening bin file: %w", err))
		}
		f.Write(binary)
		f.Close()
	}
}

func init() {
	createOoklaBinary()
}

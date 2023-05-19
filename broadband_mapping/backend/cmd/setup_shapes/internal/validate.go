package internal

import (
	"fmt"
	"os"
	"os/exec"
)

func ValidateRequiredBinary(name string) {
	_, err := exec.LookPath(name)
	if err != nil {
		fmt.Printf("Error: %s executable was not found in PATH", name)
		os.Exit(1)
	}
}

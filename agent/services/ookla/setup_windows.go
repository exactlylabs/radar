package ookla

import (
	_ "embed"
	"fmt"
	"os"
)

//go:embed ookla.exe
var ooklaBinary []byte

const (
	binaryFilename = "ookla.exe"
)

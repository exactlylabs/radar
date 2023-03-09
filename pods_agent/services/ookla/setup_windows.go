package ookla

import (
	_ "embed"
)

//go:embed ookla.exe
var ooklaBinary []byte

const (
	binaryFilename = "ookla.exe"
)

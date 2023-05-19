//go:build !windows

package ookla

import (
	_ "embed"
)

//go:embed ookla
var ooklaBinary []byte

const (
	binaryFilename = "ookla"
)

//go:build amd64

package ookla

import (
	_ "embed"
)

//go:embed ookla_amd64
var ooklaBinary []byte

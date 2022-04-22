//go:build armhf

package ookla

import (
	_ "embed"
)

//go:embed ookla_armhf
var ooklaBinary []byte

//go:build armhf

package ooklabinaries

import (
	_ "embed"
)

//go:embed ookla_armhf
var ooklaBinary []byte

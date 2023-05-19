package update

import (
	_ "embed"
)

//go:embed rootCA.pem
var rootCAFile []byte

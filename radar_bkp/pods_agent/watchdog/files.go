package watchdog

import (
	"embed"
)

//go:embed osfiles/*
var OSFS embed.FS

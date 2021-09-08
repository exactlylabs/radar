package utilities

import (
	shp "github.com/jonas-p/go-shp"
	"github.com/paulmach/orb"
)

func ShpToOrb(shapfilePath) orb.Collection {
	shp.Open()
}

package namespaces

type Namespace string

const (
	US_STATE      Namespace = "states"
	US_COUNTY     Namespace = "counties"
	US_TTRACT     Namespace = "tribal_tracts"
	MULTI_LAYERED Namespace = "multi_layer" // to load the vector tiles with multiple layers
)

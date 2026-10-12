package reversegeocoder

import (
	"log"
	"sort"
	"strings"

	"github.com/exactlylabs/mlab-processor/pkg/app/config"
)

// KeptNamespaces are the shape namespaces the ingestor reads
// (broadband_mapping/backend/pkg/app/ingestor/reader.go). Shapes of any other namespace
// in SHAPE_PATHS (ZIP_CODES, CENSUS_TRACTS) are not loaded: their output was never used.
var KeptNamespaces = map[string]bool{
	"US_STATES":        true,
	"US_COUNTIES":      true,
	"US_AIANNH":        true,
	"US_TRIBAL_TRACTS": true,
}

type shapeEntry struct {
	namespace, path string
}

func shapePathEntries(conf *config.ProcessorConfig) []shapeEntry {
	var out []shapeEntry
	for _, path := range strings.Split(conf.ShapePaths, ";") {
		if strings.TrimSpace(path) == "" {
			continue
		}
		parts := strings.SplitN(path, ":", 2)
		if len(parts) != 2 {
			log.Printf("ReverseGeocoder - ignoring malformed SHAPE_PATHS entry %q", path)
			continue
		}
		if !KeptNamespaces[parts[0]] {
			log.Printf("ReverseGeocoder - ignoring namespace %s (%s): not ingested", parts[0], parts[1])
			continue
		}
		out = append(out, shapeEntry{parts[0], parts[1]})
	}
	sort.Slice(out, func(i, j int) bool { return out[i].namespace < out[j].namespace })
	return out
}

package reversegeocoder

import (
	"fmt"
	"io/fs"
	"path/filepath"
	"strings"

	"github.com/exactlylabs/mlab-processor/pkg/app/config"
)

func shapePathEntries(conf *config.ProcessorConfig) map[string]string {
	paths := make(map[string]string)
	for _, path := range strings.Split(conf.ShapePaths, ";") {
		parts := strings.Split(path, ":")
		paths[parts[0]] = parts[1]
	}

	return paths
}

func tractShapesByStateId(conf *config.ProcessorConfig) map[string]string {
	paths := make(map[string]string)

	err := filepath.WalkDir(conf.TractsShapeDir, func(path string, d fs.DirEntry, err error) error {
		if d.IsDir() {
			return nil
		}
		if matched, err := filepath.Match("*.zip", filepath.Base(path)); err != nil {
			return err
		} else if matched {
			filename := d.Name()
			substrs := strings.Split(filename, "_")
			if len(substrs) != 4 {
				return fmt.Errorf("tracts file format is wrong. expected: tl_[year]_[state_fips]_tract.zip")
			}
			paths[substrs[2]] = path
		}
		return nil
	})

	if err != nil {
		panic(fmt.Errorf("reversegeocoder.tractShapesByStateId failed finding shape files: %w", err))
	}
	return paths
}

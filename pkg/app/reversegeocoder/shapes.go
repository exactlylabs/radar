package reversegeocoder

import (
	"fmt"
	"io/fs"
	"path/filepath"
	"strings"
)

func tractShapesByStateId(tractsDir string) map[string]string {
	paths := make(map[string]string)

	err := filepath.WalkDir(tractsDir, func(path string, d fs.DirEntry, err error) error {
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

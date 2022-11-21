package internal

import (
	"fmt"
	"os/exec"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/errors"
)

func GeoJSONToTilesets(src, dst string, layerName string, startingZoom, endZoom uint) error {
	out, err := exec.Command(
		"tippecanoe", "-f", "-Z", fmt.Sprintf("%d", startingZoom), "-z", fmt.Sprintf("%d", endZoom),
		"-o", dst, "--drop-densest-as-needed",
		"--extend-zooms-if-still-dropping", "-l", layerName, src,
	).Output()
	if err != nil {
		return errors.Wrap(err, "internal.GeoJSONToTilesets Output: %s", out)
	}
	return nil
}

func MergeTilesets(dst string, srcs ...string) error {
	args := []string{"-o", dst, "--force"}
	args = append(args, srcs...)
	out, err := exec.Command("tile-join", args...).Output()
	if err != nil {
		return errors.Wrap(err, "internal.MergeTilesets Output: %s", out)
	}
	return nil
}

package internal

import (
	"archive/zip"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/app/ports/storages"
	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/errors"
	"github.com/paulmach/orb/geojson"
)

const DefaultSimplify = 0.0012

func unzipShapeFile(path string) (string, error) {
	targetDir := strings.TrimSuffix(path, filepath.Ext(path))
	reader, err := zip.OpenReader(path)
	shapeFileName := ""
	if err != nil {
		return "", errors.Wrap(err, "internal.unzipShapeFile OpenReader")
	}
	for _, zipContent := range reader.File {
		if filepath.Ext(zipContent.Name) == ".shp" {
			shapeFileName = zipContent.Name
		}
		if err := os.MkdirAll(targetDir, os.FileMode(0755)); err != nil {
			return "", errors.Wrap(err, "internal.unzipShapeFile MkdirAll")
		}
		targetFile, err := os.OpenFile(filepath.Join(targetDir, zipContent.Name), os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0664)
		if err != nil {
			return "", errors.Wrap(err, "internal.unzipShapeFile OpenFile")
		}
		reader, err := zipContent.Open()
		if err != nil {
			return "", errors.Wrap(err, "internal.unzipShapeFile Open")
		}
		if _, err := io.Copy(targetFile, reader); err != nil {
			return "", errors.Wrap(err, "internal.unzipShapeFile Copy")
		}
	}
	return filepath.Join(targetDir, shapeFileName), nil
}

func ShapeToGeoJSON(src string, dst string, simplify float64) error {
	shapeFilePath, err := unzipShapeFile(src)
	if err != nil {
		return errors.Wrap(err, "internal.ShapeToGeoJSON unzipShapeFile")
	}
	args := []string{"-simplify", fmt.Sprintf("%f", simplify), "-f", "GeoJSON", dst, shapeFilePath}
	out, err := exec.Command("ogr2ogr", args...).Output()
	if err != nil {
		return fmt.Errorf("internal.ShapeToGeoJSON Output: %v: %w", string(out), err)
	}
	return nil
}

func LoadGeoJSON(path string) (geojson.FeatureCollection, error) {
	fc := geojson.FeatureCollection{}
	f, err := os.Open(path)
	if err != nil {
		return fc, errors.Wrap(err, "internal.LoadGeoJSON Open")
	}
	data, err := ioutil.ReadAll(f)
	if err != nil {
		return fc, errors.Wrap(err, "internal.LoadGeoJSON ReadAll")
	}
	if err := fc.UnmarshalJSON(data); err != nil {
		return fc, errors.Wrap(err, "internal.LoadGeoJSON UnmarshalJSON")
	}
	return fc, nil
}

func ReWriteGeoJSONFromGeospaces(dst string, fc geojson.FeatureCollection, geospaces []DBGeospaceFeature) error {
	// Now, rewrite the GeoJSON's Properties to have only the fields of interest
	for _, g := range geospaces {
		g.Feature.Properties = geojson.Properties{
			"GEOID": g.Geospace.GeoId,
			"ID":    g.Geospace.Id,
			"summary": storages.GeospaceSummaryResult{
				Geospace: *g.Geospace,
			},
		}
	}
	data, err := fc.MarshalJSON()
	if err != nil {
		panic(err)
	}
	f, err := os.OpenFile(dst, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0664)
	if err != nil {
		return errors.Wrap(err, "internal.ReWriteGeoJSONFromGeospaces OpenFile")
	}
	defer f.Close()
	_, err = f.Write(data)
	if err != nil {
		return errors.Wrap(err, "internal.ReWriteGeoJSONFromGeospaces Write")
	}
	return nil
}

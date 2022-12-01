package config

import (
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"reflect"
	"strings"
)

type ProcessorConfig struct {
	FileFormat       string `config:"FILE_FORMAT,default=avro"` // Accepts avro or parquet
	EarliestDate     string `config:"EARLIEST_DATE,default=2019-05-13"`
	Ipv4DBPath       string `config:"IPV4_DB_PATH,default=./input/GeoLite2-City-Blocks-IPv4.csv"`
	Ipv6DBPath       string `config:"IPV6_DB_PATH,default=./input/GeoLite2-City-Blocks-IPv6.csv"`
	AsnIpv4DBPath    string `config:"ASN_IPV4_DB_PATH,default=./input/GeoLite2-ASN-Blocks-IPv4.csv"`
	AsnIpv6DBPath    string `config:"ASN_IPV4_DB_PATH,default=./input/GeoLite2-ASN-Blocks-IPv6.csv"`
	Asn2OrgDBPath    string `config:"ASN2ORG_DB_PATH,default=./input/20221001.as-org2info.jsonl"`
	ShapePaths       string `config:"SHAPE_PATHS,default=US_STATES:./input/tl_2021_us_state.zip;US_COUNTIES:./input/tl_2021_us_county.zip;US_AIANNH:./input/tl_2022_us_aiannh.zip;ZIP_CODES:./input/tl_2021_us_zcta520.zip"`
	TractsShapeDir   string `config:"TRACTS_SHAPE_DIR,default=./input/tracts"`
	UploadBucketName string `config:"UPLOAD_BUCKET_NAME,default=mlab-processed-data"`
}

var cachedConfig *ProcessorConfig

func GetConfig() *ProcessorConfig {
	if cachedConfig == nil {
		cachedConfig = processConfig()
	}

	return cachedConfig
}

func (c *ProcessorConfig) ShapePathEntries() map[string]string {
	paths := make(map[string]string)
	for _, path := range strings.Split(c.ShapePaths, ";") {
		parts := strings.Split(path, ":")
		paths[parts[0]] = parts[1]
	}

	return paths
}

func (c *ProcessorConfig) TractShapesByStateId() map[string]string {
	paths := make(map[string]string)

	err := filepath.WalkDir(c.TractsShapeDir, func(path string, d fs.DirEntry, err error) error {
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
		panic(fmt.Errorf("config.TractShapesByStateId failed finding shape files: %w", err))
	}
	return paths
}

func processConfig() *ProcessorConfig {
	config := &ProcessorConfig{}

	// Load ENV variables to override config using struct tags and reflection
	// to discover the environment variable names which map to config properties.
	t := reflect.TypeOf(ProcessorConfig{})
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		fieldToSet := reflect.ValueOf(config).Elem().FieldByName(field.Name)

		// fields are comma seperated, first field is env name, second is if config is required or not
		metadata := field.Tag.Get("config")
		metaParts := strings.Split(metadata, ",")

		if len(metaParts) > 1 {
			defaultPart := metaParts[1]
			defaultValue := strings.Split(defaultPart, "=")[1]
			fieldToSet.SetString(defaultValue)
		}

		envName := metaParts[0]
		envValue := os.Getenv(envName)
		if envValue != "" {
			fieldToSet.SetString(envValue)
		}
	}

	return config
}

package config

import (
	"fmt"
	"os"
	"reflect"
	"strings"
)

type ProcessorConfig struct {
	EarliestDate string `config:"EARLIEST_DATE,default=2019-05-13"`
	Ipv4DBPath   string `config:"IP_DB_PATH,default=./input/GeoLite2-City-Blocks-IPv4.csv"`
	Ipv6DBPath   string `config:"IP_DB_PATH,default=./input/GeoLite2-City-Blocks-IPv6.csv"`
	ShapePaths   string `config:"SHAPE_PATHS,default=US_COUNTIES:./input/tl_2021_us_county/tl_2021_us_county.shp;US_TRIBAL_TRACTS:./input/tl_2021_us_ttract/tl_2021_us_ttract.shp"`
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

	fmt.Println(paths)

	return paths
}

func processConfig() *ProcessorConfig {
	fmt.Println("Processing config...")
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

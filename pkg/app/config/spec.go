package config

import (
	"os"
	"reflect"
	"strings"
)

type ProcessorConfig struct {
	EarliestDate string `config:EARLIEST_DATE,default=2019-05-13`
	SourceBucket string `config:SOURCE_BUCKET,default=archive-measurement-lab`
}

func NewProcessorConfig() *ProcessorConfig {
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

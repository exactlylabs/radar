package config

import (
	"fmt"
	"os"
	"reflect"
	"strconv"
	"strings"

	"github.com/exactlylabs/mlab-mapping/backend/pkg/services/errors"
)

type Config struct {
	DBName                    string `config:"DB_NAME"`
	DBUser                    string `config:"DB_USER"`
	DBPassword                string `config:"DB_PASSWORD"`
	DBHost                    string `config:"DB_HOST"`
	DBPortStr                 string `config:"DB_PORT"`
	FilesBucketName           string `config:"FILES_BUCKET_NAME"`
	CORSAllowedOrigins        string `config:"CORS_ALLOWED_ORIGINS"`
	TSDBStorageNWorkers       string `config:"TSDB_STORAGE_NWORKERS"`
	ClickhouseStorageNWorkers string `config:"CLICKHOUSE_STORAGE_NWORKERS"`
	StorageType               string `config:"STORAGE_TYPE"`
}

func (c *Config) DBDSN() string {
	return fmt.Sprintf(
		"host=%s dbname=%s user=%s password=%s port=%s sslmode=disable",
		c.DBHost, c.DBName, c.DBUser, c.DBPassword, c.DBPort,
	)
}

func (c *Config) DBPort() int {
	dbPort, err := strconv.Atoi(c.DBPortStr)
	if err != nil {
		panic(errors.Wrap(err, "Config#DBPort Atoi"))
	}
	return dbPort
}

func (c *Config) AllowedOrigins() []string {
	return strings.Split(c.CORSAllowedOrigins, ",")
}

var cachedConfig *Config

func GetConfig() *Config {
	if cachedConfig == nil {
		cachedConfig = processConfig()
	}

	return cachedConfig
}

func processConfig() *Config {
	config := ProdConfig
	if os.Getenv("ENVIRONMENT") == "DEV" {
		config = DevConfig
	}

	// Load ENV variables to override config using struct tags and reflection
	// to discover the environment variable names which map to config properties.
	t := reflect.TypeOf(Config{})
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

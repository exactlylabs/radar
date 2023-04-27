package config

import (
	"fmt"
	"os"
	"reflect"
	"strconv"
	"strings"

	"github.com/exactlylabs/go-errors/pkg/errors"
)

type Config struct {
	Environment               string
	DBName                    string `config:"DB_NAME"`
	DBUser                    string `config:"DB_USER"`
	DBPassword                string `config:"DB_PASSWORD"`
	DBHost                    string `config:"DB_HOST"`
	DBPortStr                 string `config:"DB_PORT"`
	DBSecureTLSStr            string `config:"DB_SECURE_TLS"`
	FilesBucketName           string `config:"FILES_BUCKET_NAME"`
	CORSAllowedOrigins        string `config:"CORS_ALLOWED_ORIGINS"`
	ClickhouseStorageNWorkers string `config:"CLICKHOUSE_STORAGE_NWORKERS"`
	UseCacheStr               string `config:"USE_CACHE"`
	StatesGeoJSONFile         string `config:"STATES_GEOJSON_FILE"`
	CountiesGeoJSONFile       string `config:"COUNTIES_GEOJSON_FILE"`
	TribalTractsGeoJSONFile   string `config:"TRIBAL_TRACTS_GEOJSON_FILE"`
	StatesMBTilesFile         string `config:"STATES_MBTILES_FILE"`
	CountiesMBTilesFile       string `config:"COUNTIES_MBTILES_FILE"`
	TribalTractsMBTilesFile   string `config:"TRIBAL_TRACTS_MBTILES_FILE"`
	MultiLayeredMBTilesFile   string `config:"MULTI_LAYERED_MBTILES_FILE"`
	StatesLayerName           string `config:"STATES_LAYER_NAME"`
	CountiesLayerName         string `config:"COUNTIES_LAYER_NAME"`
	TribalTractsLayerName     string `config:"TRIBAL_TRACTS_LAYER_NAME"`
}

func (c *Config) DBDSN() string {
	return fmt.Sprintf(
		"host=%s dbname=%s user=%s password=%s port=%s sslmode=disable",
		c.DBHost, c.DBName, c.DBUser, c.DBPassword, c.DBPortStr,
	)
}

func (c *Config) DBPort() int {
	dbPort, err := strconv.Atoi(c.DBPortStr)
	if err != nil {
		panic(errors.Wrap(err, "Config#DBPort Atoi"))
	}
	return dbPort
}

func (c *Config) UseCache() bool {
	b, err := strconv.ParseBool(c.UseCacheStr)
	if err != nil {
		panic(errors.Wrap(err, "Config#UseCache ParseBool"))
	}
	return b
}

func (c *Config) AllowedOrigins() []string {
	return strings.Split(c.CORSAllowedOrigins, ",")
}

func (c *Config) DBSecureTLS() bool {
	b, err := strconv.ParseBool(c.DBSecureTLSStr)
	if err != nil {
		panic(errors.Wrap(err, "config.Config#DBSecureTLS ParseBool"))
	}
	return b
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

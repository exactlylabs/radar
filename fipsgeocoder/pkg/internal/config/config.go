package config

import (
	"os"
	"reflect"
	"strings"
)

type Config struct {
	StateShapePath  string `config:"STATES_SHAPE_PATH,default=./shapes/states/cb_2018_us_state_5m.shp"`
	CountyShapePath string `config:"COUNTIES_SHAPE_PATH,default=./shapes/counties/tl_2021_us_county.shp"`
}

var config *Config

func LoadConfig() *Config {
	if config != nil {
		return config
	}
	config = &Config{}
	m := mapConfigs(config)
	for envName, value := range m {
		v := os.Getenv(envName)
		if v != "" {
			value.SetString(v)
		}
	}

	return config
}

func mapConfigs(config *Config) map[string]reflect.Value {
	configs := make(map[string]reflect.Value)
	confValue := reflect.ValueOf(config).Elem()
	confType := confValue.Type()
	for i := 0; i < confType.NumField(); i++ {
		field := confType.Field(i)
		conf := field.Tag.Get("config")
		confs := strings.Split(conf, ",")
		envName := confs[0]
		if len(confs) > 1 {
			// get default value
			d := strings.Split(confs[1], "=")
			confValue.Field(i).SetString(d[1])
		}
		configs[envName] = confValue.Field(i)
	}
	return configs
}

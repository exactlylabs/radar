package config

import (
	"bufio"
	"fmt"
	"os"
	"reflect"
	"strings"
)

type Config struct {
	ServerURL  string `config:"server_url"`
	ClientId   string `config:"client_id"`
	Secret     string `config:"secret"`
	TestFreq   string `config:"test_freq"`
	PingFreq   string `config:"ping_freq"`
	LastTested string `config:"last_tested"`
}

func mapConfigs(config *Config) map[string]reflect.Value {
	configs := make(map[string]reflect.Value)
	confValue := reflect.ValueOf(config).Elem()
	confType := confValue.Type()
	for i := 0; i < confType.NumField(); i++ {
		field := confType.Field(i)
		confText := field.Tag.Get("config")
		configs[confText] = confValue.Field(i)
	}
	return configs
}

func filePath() string {
	configPath := os.Getenv("CONF_FILE_PATH")
	if configPath == "" {
		configPath = "config.conf"
	}
	return configPath
}

// LoadConfig from a .conf file
func LoadConfig() *Config {
	environment := os.Getenv("ENVIRONMENT")
	var config *Config
	switch environment {
	case "DEV":
		config = DevConfig
	case "PROD":
		config = ProdConfig
	default:
		config = DevConfig
	}

	configValues := mapConfigs(config)
	f, err := os.Open(filePath())
	if err != nil {
		panic(fmt.Errorf("config.LoadConfig error: %w", err))
	}
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.Trim(strings.Trim(scanner.Text(), " "), "\t")
		if len(line) == 0 || line[0] == '#' {
			continue
		}
		confLine := strings.Split(line, "=")
		if len(confLine) != 2 || confLine[1] == "" {
			continue
		}
		if value, exists := configValues[confLine[0]]; exists {
			if value.Kind() == reflect.Ptr {
				strVal := reflect.ValueOf(&confLine[1])
				value.Set(strVal)
			} else {
				value.Set(reflect.ValueOf(confLine[1]))
			}

		}
	}
	return config
}

// Save will store the current configuration into the .ini file
func Save(conf *Config) error {
	f, err := os.OpenFile(filePath(), os.O_WRONLY|os.O_CREATE, 0660)
	if err != nil {
		return fmt.Errorf("config.Save error opening file: %w", err)
	}
	defer f.Close()
	confVal := reflect.ValueOf(conf).Elem()
	for i := 0; i < confVal.NumField(); i++ {
		val := confVal.Field(i)
		key := confVal.Type().Field(i).Tag.Get("config")
		if key == "" {
			continue
		}
		if val.Kind() == reflect.Ptr && val.Elem().IsValid() {
			f.WriteString(fmt.Sprintf("%s=%v\n", key, val.Elem().Interface()))
		} else if val.Kind() != reflect.Ptr {
			f.WriteString(fmt.Sprintf("%s=%v\n", key, val.Interface()))
		}
	}
	return nil
}

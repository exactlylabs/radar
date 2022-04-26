package config

import (
	"bufio"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"reflect"
	"strings"

	"github.com/exactlylabs/radar/agent/internal/info"
)

type Config struct {
	ServerURL  string `config:"server_url"`
	ClientId   string `config:"client_id"`
	Secret     string `config:"secret"`
	TestFreq   string `config:"test_freq"`
	TestMinute string `config:"test_minute"`
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

func basePath() string {
	if info.IsDev() {
		return ""
	}
	basePath, err := os.UserConfigDir()
	if err != nil {
		basePath = ""
	}
	return filepath.Join(basePath, "radar")
}

// OpenFile returns a io.Writer interface that writes to the
// filename at the application configuration directory
func OpenFile(filename string, flag int, perm fs.FileMode) (*os.File, error) {
	f, err := os.OpenFile(
		filepath.Join(basePath(), filename),
		flag, perm,
	)
	if err != nil {
		return nil, err
	}
	return f, nil
}

// NewFileLoader returns an io.Reader interface that loads the filename
// from the application configuration directory
func NewFileLoader(filename string) (io.Reader, error) {
	f, err := os.Open(filepath.Join(basePath(), filename))
	if err != nil {
		return nil, err
	}
	return f, nil
}

// LoadConfig from a .conf file
func LoadConfig() *Config {

	config := ProdConfig
	if info.IsDev() {
		config = DevConfig
	}

	configValues := mapConfigs(config)

	f, err := NewFileLoader("config.conf")
	if err != nil && !errors.Is(err, fs.ErrNotExist) {
		panic(fmt.Errorf("config.LoadConfig error: %w", err))
	} else if err == nil {
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
	}
	return config
}

// Save will store the current configuration into the .ini file
func Save(conf *Config) error {
	f, err := OpenFile("config.conf", os.O_WRONLY|os.O_CREATE, 0660)
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

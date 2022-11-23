package config

import (
	"bufio"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"log"
	"os"
	"path/filepath"
	"reflect"
	"runtime"
	"strconv"
	"strings"
	"time"

	"github.com/exactlylabs/radar/agent/internal/info"
)

type Config struct {
	ServerURL         string `config:"server_url"`
	ClientId          string `config:"client_id"`
	Secret            string `config:"secret"`
	PingFreq          string `config:"ping_freq"`
	LastTested        string `config:"last_tested"`
	LastUpdated       string `config:"last_updated"`
	LastDownloadSpeed string `config:"last_download_speed"`
	LastUploadSpeed   string `config:"last_upload_speed"`
	SentryDsn         string
	RegistrationToken *string `config:"registration_token"`
}

func (c *Config) LastTestedAt() *time.Time {
	if c.LastTested == "" {
		return nil
	}
	intVal, err := strconv.ParseInt(c.LastTested, 10, 64)
	if err != nil {
		panic(fmt.Errorf("config#LastTestedAt Atoi: %v", err))
	}
	t := time.Unix(intVal, 0)
	return &t
}

var config *Config
var basePath string

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

func SetBasePath(path string) {
	basePath = path
}

func BasePath() string {
	if basePath != "" {
		return basePath
	}
	if info.IsDev() {
		basePath, err := os.Getwd()
		if err != nil {
			panic(fmt.Errorf("config.BasePath error: %w", err))
		}
		return basePath
	}
	var err error
	// For Windows, it is best to always store on AppData,
	// since if running as a service, it will be sent to a system32 directory
	switch runtime.GOOS {
	case "windows":
		basePath = os.Getenv("ProgramData")
	default:
		basePath, err = os.UserConfigDir()
		if err != nil {
			basePath, err = os.Getwd()
			if err != nil {
				panic(fmt.Errorf("config.BasePath error: %w", err))
			}
		}
	}

	basePath = filepath.Join(basePath, "radar")
	os.Mkdir(basePath, 0775)
	return basePath
}

// Join will join the config base directory with
// given paths
func Join(elements ...string) string {
	return filepath.Join(BasePath(), filepath.Join(elements...))
}

// OpenFile returns a io.Writer interface that writes to the
// filename at the application configuration directory
func OpenFile(filename string, flag int, perm fs.FileMode) (*os.File, error) {
	path := Join(filename)
	err := os.MkdirAll(filepath.Dir(path), 0755)
	if err != nil {
		return nil, err
	}
	f, err := os.OpenFile(path, flag, perm)
	if err != nil {
		return nil, err
	}
	return f, nil
}

// NewFileLoader returns an io.Reader interface that loads the filename
// from the application configuration directory
func NewFileLoader(filename string) (io.Reader, error) {
	f, err := os.Open(filepath.Join(BasePath(), filename))
	if err != nil {
		return nil, err
	}
	return f, nil
}

// LoadConfig from a .conf file
func LoadConfig() *Config {
	if config != nil {
		return config
	}
	config = ProdConfig
	if info.IsDev() {
		config = DevConfig
	}

	configValues := mapConfigs(config)
	log.Printf("Loading config file at %v", Join("config.conf"))
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

func Reload() *Config {
	config = nil
	return LoadConfig()
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

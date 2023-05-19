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

	"github.com/exactlylabs/radar/pods_agent/internal/info"
	"github.com/exactlylabs/radar/pods_agent/services/tracing"
	"github.com/joho/godotenv"
)

func init() {
	godotenv.Load()
}

type Config struct {
	Environment       string
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
	// CRL stands for Certificate Revocation List
	CRLUrl string `env:"CRL_URL"`
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
var configFilePath string

func mapConfigs(config *Config) map[string]reflect.Value {
	configs := make(map[string]reflect.Value)
	confValue := reflect.ValueOf(config).Elem()
	confType := confValue.Type()
	for i := 0; i < confType.NumField(); i++ {
		field := confType.Field(i)
		confText := field.Tag.Get("config")
		if confText != "" {
			configs[confText] = confValue.Field(i)
		} else if envText, exists := field.Tag.Lookup("env"); exists {
			// Populate environment type configurations
			envOptions := strings.Split(envText, ",")
			if len(envOptions) > 0 {
				defaultValue := ""
				if len(envOptions) > 1 {
					defaultValue = envOptions[1]
				}
				if val, exists := os.LookupEnv(envOptions[0]); exists {
					confValue.Field(i).SetString(val)
				} else if str, isStr := confValue.Field(i).Interface().(string); isStr && str == "" {
					confValue.Field(i).SetString(defaultValue)
				} else if strPtr, isStrPtr := confValue.Field(i).Interface().(*string); isStrPtr && strPtr == nil {
					confValue.Field(i).Set(reflect.ValueOf(&defaultValue))
				}
			}
		}

	}
	return configs
}

func SetBasePath(path string) {
	basePath = path
}

// hasOldBasePath checks if this agent is using an old directory as the config path
func hasOldBasePath() bool {
	if _, err := os.Stat(filepath.Join(os.Getenv("ProgramData"), "radar", "config.conf")); err != nil {
		return false
	}
	return true
}

func SetConfigFilePath(path string) {
	configFilePath = path
}

func ConfigFilePath() string {
	if configFilePath == "" {
		return Join("config.conf")
	}
	return configFilePath
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
	switch runtime.GOOS {
	case "windows":
		// For Windows, when running as a service, we end up not knowing how to get the correct AppData path,
		// due to this, it's best if we just use the binary's directory
		// But first, we need to see if this agent already has a config file in the old location.
		// If it does, we use it instead
		if hasOldBasePath() {
			basePath = filepath.Join(os.Getenv("ProgramData"), "radar")
		} else {
			caller, err := os.Executable()
			if err != nil {
				err = fmt.Errorf("service.setupInstall err obtaining exec path: %w", err)
				log.Println(err)
				tracing.NotifyError(err, tracing.Context{})
				// default to AppData
				basePath = filepath.Join(os.Getenv("AppData"), "Exactlylabs", "Radar")
			} else {
				basePath = filepath.Dir(caller)
			}
		}

	default:
		basePath, err = os.UserConfigDir()
		if err != nil {
			basePath, err = os.Getwd()
			if err != nil {
				panic(fmt.Errorf("config.BasePath error: %w", err))
			}
		}
		basePath = filepath.Join(basePath, "radar")
	}

	os.Mkdir(basePath, 0775)
	return basePath
}

// Join will join the config base directory with
// given paths
func Join(elements ...string) string {
	return filepath.Join(BasePath(), filepath.Join(elements...))
}

func openFile(path string, flag int, perm fs.FileMode) (*os.File, error) {
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

// OpenFile returns a io.Writer interface that writes to the
// filename at the application configuration directory
func OpenFile(filename string, flag int, perm fs.FileMode) (*os.File, error) {
	path := Join(filename)
	return openFile(path, flag, perm)
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
	log.Printf("Loading config file at %v", ConfigFilePath())
	f, err := os.Open(ConfigFilePath())
	if err != nil && !errors.Is(err, fs.ErrNotExist) {
		panic(fmt.Errorf("config.LoadConfig error: %w", err))
	} else if err == nil {
		defer f.Close()
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
	f, err := openFile(ConfigFilePath(), os.O_WRONLY|os.O_CREATE, 0660)
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

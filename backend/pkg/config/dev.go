package config

import (
	"fmt"
	"runtime"
)

var DevConfig = &Config{
	DBName:                    "default",
	DBUser:                    "default",
	DBPassword:                "",
	DBHost:                    "localhost",
	DBPort:                    "9001",
	FilesBucketName:           "mlab-processed-data",
	ClickhouseStorageNWorkers: fmt.Sprintf("%d", runtime.NumCPU()),
}

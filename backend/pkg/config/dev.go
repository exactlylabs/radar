package config

import (
	"fmt"
	"runtime"
)

var DevConfig = &Config{
	DBName:                    "mlab-mapping",
	DBUser:                    "postgres",
	DBPassword:                "postgres",
	DBHost:                    "localhost",
	DBPort:                    "5432",
	FilesBucketName:           "mlab-processed-data",
	TSDBStorageNWorkers:       fmt.Sprintf("%d", runtime.NumCPU()),
	ClickhouseStorageNWorkers: fmt.Sprintf("%d", runtime.NumCPU()),
}

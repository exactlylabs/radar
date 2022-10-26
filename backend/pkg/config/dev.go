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
	DBPortStr:                 "9001",
	FilesBucketName:           "mlab-processed-data",
	ClickhouseStorageNWorkers: fmt.Sprintf("%d", runtime.NumCPU()),
}

package config

import (
	"fmt"
	"runtime"
)

var ProdConfig = &Config{
	DBUser:                    "",
	DBPassword:                "",
	DBHost:                    "",
	DBPort:                    "",
	FilesBucketName:           "mlab-processed-data",
	TSDBStorageNWorkers:       fmt.Sprintf("%d", runtime.NumCPU()),
	ClickhouseStorageNWorkers: fmt.Sprintf("%d", runtime.NumCPU()),
}

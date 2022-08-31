package config

var DevConfig = &Config{
	DBName:          "mlab-mapping",
	DBUser:          "postgres",
	DBPassword:      "postgres",
	DBHost:          "localhost",
	DBPort:          "5432",
	FilesBucketName: "mlab-processed-data",
}

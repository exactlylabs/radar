package model

import (
	"fmt"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func init() {
	var err error
	dsn := os.Getenv("PG_DSN")
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(fmt.Errorf("failed to connect to PG: %w", err))
	}
}

func AutoMigrate() {
	DB.AutoMigrate(&User{})
	DB.AutoMigrate(&Client{})
	DB.AutoMigrate(&Measurement{})
}

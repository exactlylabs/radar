package model

import (
	"time"

	"gorm.io/gorm"
)

type Client struct {
	ID                string `gorm:"primaryKey"`
	SecretHash        string
	Name              string
	PublicKey         string
	EndpointHost      string `gorm:"UNIQUE_INDEX:clientremoteport;type:text;not null"`
	EndpointPort      int
	RemoteGatewayPort int `gorm:"UNIQUE_INDEX:clientremoteport;index;not null"`
	CreatedAt         time.Time
	UpdatedAt         time.Time
	DeletedAt         gorm.DeletedAt `gorm:"index"`
}

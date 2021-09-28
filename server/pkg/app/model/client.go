package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Client struct {
	ID         string    `gorm:"primaryKey"`
	UserID     uuid.UUID `gorm:"type:uuid"`
	SecretHash string

	Name    string
	Address string

	PublicKey         string
	EndpointHost      string `gorm:"UNIQUE_INDEX:clientremoteport;type:text;not null"`
	EndpointPort      int
	RemoteGatewayPort int `gorm:"UNIQUE_INDEX:clientremoteport;index;not null"`
	CreatedAt         time.Time
	UpdatedAt         time.Time
	DeletedAt         gorm.DeletedAt `gorm:"index"`
}

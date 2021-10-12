package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID uuid.UUID `gorm:"->;type:uuid;primaryKey;default:uuid_generate_v4()"`

	Email        string `gorm:"UNIQUE_INDEX;not null"`
	PasswordHash string

	Clients []Client

	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

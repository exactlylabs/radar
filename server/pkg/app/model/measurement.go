package model

import (
	"gorm.io/gorm"
)

type Measurement struct {
	gorm.Model
	Type     string
	BlobId   string
	ClientId string
}

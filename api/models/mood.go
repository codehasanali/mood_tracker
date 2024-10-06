package models

import (
	"time"

	"gorm.io/gorm"
)

type Mood struct {
	gorm.Model
	UserID      uint           `json:"user_id"`
	Title       string         `json:"title"`
	Description string         `json:"description"`
	Emoji       string         `json:"emoji"`
	Tags        []Tag          `gorm:"many2many:mood_tags;" json:"tags"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

type Tag struct {
	gorm.Model
	Name  string `gorm:"unique" json:"name"`
	Moods []Mood `gorm:"many2many:mood_tags;" json:"-"`
}

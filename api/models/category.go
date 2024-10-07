package models

import (
	"time"

	"gorm.io/gorm"
)

type Category struct {
	gorm.Model
	Name      string    `gorm:"uniqueIndex:idx_name_user_id" json:"name"`
	UserID    uint      `gorm:"uniqueIndex:idx_name_user_id" json:"user_id"`
	User      User      `gorm:"foreignKey:UserID" json:"-"`
	Moods     []Mood    `gorm:"many2many:mood_categories;" json:"moods,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

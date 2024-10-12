package handler

import (
	"api/prisma/db"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateTag(client *db.PrismaClient) gin.HandlerFunc {
    return func(c *gin.Context) {
        var tag struct {
            Name     string `json:"name" binding:"required"`
            IsPublic bool   `json:"isPublic"`
        }
        if err := c.ShouldBindJSON(&tag); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
            return
        }

        userIDInterface, exists := c.Get("user_id")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
            return
        }

        userID, ok := userIDInterface.(uint)
        if !ok {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID type"})
            return
        }

        // Check if the tag already exists for this user
        existingTag, err := client.Tag.FindFirst(
            db.Tag.Name.Equals(tag.Name),
            db.Tag.User.Where(
                db.User.ID.Equals(int(userID)),
            ),
        ).Exec(c.Request.Context())

        if err == nil && existingTag != nil {
            c.JSON(http.StatusConflict, gin.H{"error": "A tag with this name already exists for the user"})
            return
        }

        createdTag, err := client.Tag.CreateOne(
            db.Tag.Name.Set(tag.Name),
            db.Tag.User.Link(
                db.User.ID.Equals(int(userID)),
            ),
            db.Tag.IsPublic.Set(tag.IsPublic),
        ).Exec(c.Request.Context())

        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create tag: " + err.Error()})
            return
        }

        c.JSON(http.StatusCreated, createdTag)
    }
}

func GetAllTags(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDInterface, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
			return
		}

		userID, ok := userIDInterface.(uint)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID type"})
			return
		}

		tags, err := client.Tag.FindMany(
			db.Tag.User.Where(
				db.User.ID.Equals(int(userID)),
			),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tags"})
			return
		}

		c.JSON(http.StatusOK, tags)
	}
}

func AddUserTag(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		var tagID int
		if err := c.ShouldBindJSON(&tagID); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tag ID"})
			return
		}

		userIDInterface, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
			return
		}

		userID, ok := userIDInterface.(uint)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID type"})
			return
		}

		_, err := client.Tag.FindUnique(
			db.Tag.ID.Equals(tagID),
		).Exec(c.Request.Context())

		if err != nil {
			if err == db.ErrNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "Tag not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tag"})
			}
			return
		}

		_, err = client.User.FindUnique(
			db.User.ID.Equals(int(userID)),
		).Update(
			db.User.Tags.Link(
				db.Tag.ID.Equals(tagID),
			),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add tag to user"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Tag added to user successfully"})
	}
}
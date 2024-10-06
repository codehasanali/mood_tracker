package handler

import (
	"api/prisma/db"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type MoodInput struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description" binding:"required"`
	Emoji       string `json:"emoji" binding:"required"`
	Tags        []int  `json:"tags"`
}

func CreateMood(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		var moodInput MoodInput
		if err := c.ShouldBindJSON(&moodInput); err != nil {
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

		// Create or get existing tags
		var tagIDs []int
		for _, tagID := range moodInput.Tags {
			tagName := strconv.Itoa(tagID)
			tag, err := client.Tag.FindFirst(
				db.Tag.Name.Equals(tagName),
				db.Tag.User.Where(
					db.User.ID.Equals(int(userID)),
				),
			).Exec(c.Request.Context())

			if err == db.ErrNotFound {
				// Tag doesn't exist, create it
				newTag, err := client.Tag.CreateOne(
					db.Tag.Name.Set(tagName),
					db.Tag.User.Link(
						db.User.ID.Equals(int(userID)),
					),
				).Exec(c.Request.Context())

				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create tag: " + err.Error()})
					return
				}
				tagIDs = append(tagIDs, newTag.ID)
			} else if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check existing tag: " + err.Error()})
				return
			} else {
				tagIDs = append(tagIDs, tag.ID)
			}
		}

		// Create mood
		createdMood, err := client.Mood.CreateOne(
			db.Mood.Title.Set(moodInput.Title),
			db.Mood.Description.Set(moodInput.Description),
			db.Mood.Emoji.Set(moodInput.Emoji),
			db.Mood.User.Link(
				db.User.ID.Equals(int(userID)),
			),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create mood: " + err.Error()})
			return
		}

		// Link tags to mood
		for _, tagID := range tagIDs {
			_, err := client.Mood.FindUnique(
				db.Mood.ID.Equals(createdMood.ID),
			).Update(
				db.Mood.Tags.Link(
					db.Tag.ID.Equals(tagID),
				),
			).Exec(c.Request.Context())

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to link tag to mood: " + err.Error()})
				return
			}
		}

		// Fetch the final mood with tags
		moodWithTags, err := client.Mood.FindUnique(
			db.Mood.ID.Equals(createdMood.ID),
		).With(
			db.Mood.Tags.Fetch(),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch mood with tags: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, moodWithTags)
	}
}

func GetMoods(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
			return
		}

		moods, err := client.Mood.FindMany(
			db.Mood.User.Where(
				db.User.ID.Equals(int(userID.(uint))),
			),
		).With(
			db.Mood.Tags.Fetch(),
		).OrderBy(
			db.Mood.CreatedAt.Order(db.DESC),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch moods"})
			return
		}

		c.JSON(http.StatusOK, moods)
	}
}

func GetMoodByID(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
			return
		}

		moodID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid mood ID"})
			return
		}

		mood, err := client.Mood.FindFirst(
			db.Mood.ID.Equals(moodID),
			db.Mood.User.Where(
				db.User.ID.Equals(int(userID.(uint))),
			),
		).With(
			db.Mood.Tags.Fetch(),
		).Exec(c.Request.Context())

		if err != nil {
			if err == db.ErrNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "Mood not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch mood"})
			}
			return
		}

		c.JSON(http.StatusOK, mood)
	}
}

func DeleteMood(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
			return
		}

		moodID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid mood ID"})
			return
		}

		_, err = client.Mood.FindFirst(
			db.Mood.ID.Equals(moodID),
			db.Mood.User.Where(
				db.User.ID.Equals(int(userID.(uint))),
			),
		).Exec(c.Request.Context())

		if err != nil {
			if err == db.ErrNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "Mood not found or not owned by user"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch mood"})
			}
			return
		}

		_, err = client.Mood.FindUnique(
			db.Mood.ID.Equals(moodID),
		).Delete().Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete mood"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Mood successfully deleted"})
	}
}

func GetMoodByDate(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
			return
		}

		dateStr := c.Param("date")
		date, err := time.Parse("2006-01-02", dateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
			return
		}

		moods, err := client.Mood.FindMany(
			db.Mood.User.Where(
				db.User.ID.Equals(int(userID.(uint))),
			),
			db.Mood.CreatedAt.Equals(date),
		).With(
			db.Mood.Tags.Fetch(),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch moods"})
			return
		}

		c.JSON(http.StatusOK, moods)
	}
}

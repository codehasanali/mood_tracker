package handler

import (
	"api/prisma/db"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type CategoryInput struct {
	Name string `json:"name" binding:"required"`
}

// CreateCategory creates a new category for the authenticated user
func CreateCategory(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input CategoryInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
			return
		}

		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
			return
		}

		// Convert userID to int
		userIDInt := int(userID.(uint))

		// Check if category already exists for this user
		existingCategory, err := client.Category.FindFirst(
			db.Category.Name.Equals(input.Name),
			db.Category.User.Where(
				db.User.ID.Equals(userIDInt),
			),
		).Exec(c.Request.Context())

		if err == nil && existingCategory != nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Category with this name already exists"})
			return
		}

		// Create category
		category, err := client.Category.CreateOne(
			db.Category.Name.Set(input.Name),
			db.Category.User.Link(
				db.User.ID.Equals(userIDInt),
			),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create category: " + err.Error()})
			return
		}

		c.JSON(http.StatusCreated, category)
	}
}

// GetCategories returns all categories for the authenticated user
func GetCategories(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
			return
		}

		categories, err := client.Category.FindMany(
			db.Category.User.Where(
				db.User.ID.Equals(int(userID.(uint))),
			),
		).With(
			db.Category.Moods.Fetch(),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, categories)
	}
}

// GetCategoryByID returns a specific category by ID
func GetCategoryByID(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		categoryID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
			return
		}

		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
			return
		}

		category, err := client.Category.FindFirst(
			db.Category.ID.Equals(categoryID),
			db.Category.User.Where(
				db.User.ID.Equals(int(userID.(uint))),
			),
		).With(
			db.Category.Moods.Fetch(),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
			return
		}

		c.JSON(http.StatusOK, category)
	}
}

// UpdateCategory updates an existing category
func UpdateCategory(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input CategoryInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
			return
		}

		categoryID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
			return
		}

		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
			return
		}

		// Check if new name already exists for this user (excluding current category)
		existingCategory, err := client.Category.FindFirst(
			db.Category.Name.Equals(input.Name),
			db.Category.User.Where(
				db.User.ID.Equals(int(userID.(uint))),
			),
			db.Category.ID.Not(categoryID),
		).Exec(c.Request.Context())

		if err == nil && existingCategory != nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Category with this name already exists"})
			return
		}

		category, err := client.Category.FindUnique(
			db.Category.ID.Equals(categoryID),
		).Update(
			db.Category.Name.Set(input.Name),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update category: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, category)
	}
}

// DeleteCategory deletes a category
func DeleteCategory(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		categoryID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
			return
		}

		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
			return
		}

		// Ensure the category belongs to the authenticated user
		category, err := client.Category.FindFirst(
			db.Category.ID.Equals(categoryID),
			db.Category.User.Where(
				db.User.ID.Equals(int(userID.(uint))),
			),
		).Exec(c.Request.Context())

		if err != nil || category == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Category not found or does not belong to the user"})
			return
		}

		_, err = client.Category.FindUnique(
			db.Category.ID.Equals(categoryID),
		).Delete().Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete category: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Category deleted successfully"})
	}
}

// AssignCategoryToMood assigns a category to a mood
func AssignCategoryToMood(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		moodID, err := strconv.Atoi(c.Param("moodId"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid mood ID"})
			return
		}

		categoryID, err := strconv.Atoi(c.Param("categoryId"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
			return
		}

		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
			return
		}
		// Convert userID to uint
		userIDUint, ok := userID.(uint)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
			return
		}

		// Verify both mood and category belong to user
		mood, err := client.Mood.FindFirst(
			db.Mood.ID.Equals(moodID),
			db.Mood.User.Where(
				db.User.ID.Equals(int(userIDUint)),
			),
		).With(
			db.Mood.Categories.Fetch(),
		).Exec(c.Request.Context())

		if err != nil || mood == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Mood not found or does not belong to the user"})
			return
		}

		category, err := client.Category.FindFirst(
			db.Category.ID.Equals(categoryID),
			db.Category.User.Where(
				db.User.ID.Equals(int(userIDUint)),
			),
		).Exec(c.Request.Context())

		if err != nil || category == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Category not found or does not belong to the user"})
			return
		}
		// Assign category to mood
		updatedMood, err := client.Mood.FindUnique(
			db.Mood.ID.Equals(moodID),
		).Update(
			db.Mood.Categories.Link(
				db.Category.ID.Equals(categoryID),
			),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign category to mood: " + err.Error()})
			return
		}

		if updatedMood == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Mood not found after update"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Category assigned to mood successfully", "mood": updatedMood})
	}
}

// RemoveCategoryFromMood removes a category from a mood
func RemoveCategoryFromMood(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		moodID, err := strconv.Atoi(c.Param("moodId"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid mood ID"})
			return
		}

		categoryID, err := strconv.Atoi(c.Param("categoryId"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
			return
		}

		userIDInterface, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
			return
		}

		userIDUint, ok := userIDInterface.(uint)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
			return
		}

		// Verify that the category belongs to the user
		category, err := client.Category.FindFirst(
			db.Category.ID.Equals(categoryID),
			db.Category.UserID.Equals(int(userIDUint)),
		).Exec(c.Request.Context())

		if err != nil || category == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Category not found or does not belong to the user"})
			return
		}

		_, err = client.Mood.FindUnique(
			db.Mood.ID.Equals(moodID),
		).Update(
			db.Mood.Categories.Unlink(
				db.Category.ID.Equals(categoryID),
			),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove category from mood: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Category removed from mood successfully"})
	}
}

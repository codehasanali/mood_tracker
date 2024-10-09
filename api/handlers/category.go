package handler

import (
	"api/prisma/db"
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type CategoryInput struct {
	Name string `json:"name" binding:"required"`
}

// CreateCategory creates a new category
func CreateCategory(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input CategoryInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		userID, err := getUserIDFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		// Check if category with the same name already exists for this user
		existingCategory, err := client.Category.FindFirst(
			db.Category.Name.Equals(input.Name),
			db.Category.UserID.Equals(userID),
		).Exec(c.Request.Context())

		if err == nil && existingCategory != nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Bu isimde bir kategori zaten mevcut"})
			return
		}

		createdCategory, err := client.Category.CreateOne(
			db.Category.Name.Set(input.Name),
			db.Category.User.Link(
				db.User.ID.Equals(userID),
			),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Kategori oluşturulamadı: " + err.Error()})
			return
		}

		c.JSON(http.StatusCreated, createdCategory)
	}
}

// GetCategories returns all categories for the authenticated user
func GetCategories(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := getUserIDFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		categories, err := client.Category.FindMany(
			db.Category.UserID.Equals(userID),
		).With(
			db.Category.Moods.Fetch(),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Kategoriler getirilemedi: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, categories)
	}
}

// GetCategoryByID returns a specific category by ID for the authenticated user
func GetCategoryByID(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		categoryID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz kategori ID'si"})
			return
		}

		userID, err := getUserIDFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		category, err := client.Category.FindFirst(
			db.Category.ID.Equals(categoryID),
			db.Category.UserID.Equals(userID),
		).With(
			db.Category.Moods.Fetch(),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Kategori bulunamadı"})
			return
		}

		c.JSON(http.StatusOK, category)
	}
}

// UpdateCategory updates an existing category for the authenticated user
func UpdateCategory(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input CategoryInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz girdi: " + err.Error()})
			return
		}

		categoryID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz kategori ID'si"})
			return
		}

		userID, err := getUserIDFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		// Verify category belongs to user
		existingCategory, err := client.Category.FindFirst(
			db.Category.ID.Equals(categoryID),
			db.Category.UserID.Equals(userID),
		).Exec(c.Request.Context())

		if err != nil || existingCategory == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Kategori bulunamadı veya kullanıcıya ait değil"})
			return
		}

		// Check if new name already exists for this user (excluding current category)
		duplicateCategory, err := client.Category.FindFirst(
			db.Category.Name.Equals(input.Name),
			db.Category.ID.Not(categoryID),
			db.Category.UserID.Equals(userID),
		).Exec(c.Request.Context())

		if err == nil && duplicateCategory != nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Bu isimde bir kategori zaten mevcut"})
			return
		}

		updatedCategory, err := client.Category.FindUnique(
			db.Category.ID.Equals(categoryID),
		).Update(
			db.Category.Name.Set(input.Name),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Kategori güncellenemedi: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, updatedCategory)
	}
}

// DeleteCategory deletes a category for the authenticated user
func DeleteCategory(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		categoryID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz kategori ID'si"})
			return
		}

		userID, err := getUserIDFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		// Verify category belongs to user before deletion
		existingCategory, err := client.Category.FindFirst(
			db.Category.ID.Equals(categoryID),
			db.Category.UserID.Equals(userID),
		).Exec(c.Request.Context())

		if err != nil || existingCategory == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Kategori bulunamadı veya kullanıcıya ait değil"})
			return
		}

		_, err = client.Category.FindUnique(
			db.Category.ID.Equals(categoryID),
		).Delete().Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Kategori silinemedi: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Kategori başarıyla silindi"})
	}
}

// AssignCategoryToMood assigns a category to a mood for the authenticated user
func AssignCategoryToMood(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		moodID, err := strconv.Atoi(c.Param("moodId"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz ruh hali ID'si"})
			return
		}

		categoryID, err := strconv.Atoi(c.Param("categoryId"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz kategori ID'si"})
			return
		}

		userID, err := getUserIDFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		// Verify mood belongs to user
		mood, err := client.Mood.FindFirst(
			db.Mood.ID.Equals(moodID),
			db.Mood.UserID.Equals(userID),
		).With(
			db.Mood.Categories.Fetch(),
		).Exec(c.Request.Context())

		if err != nil || mood == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Ruh hali bulunamadı veya kullanıcıya ait değil"})
			return
		}

		// Verify category belongs to user
		category, err := client.Category.FindFirst(
			db.Category.ID.Equals(categoryID),
			db.Category.UserID.Equals(userID),
		).Exec(c.Request.Context())

		if err != nil || category == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Kategori bulunamadı veya kullanıcıya ait değil"})
			return
		}

		// Check if the category is already assigned to the mood
		for _, existingCategory := range mood.Categories() {
			if existingCategory.ID == categoryID {
				c.JSON(http.StatusConflict, gin.H{"error": "Bu kategori zaten ruh haline atanmış"})
				return
			}
		}

		updatedMood, err := client.Mood.FindUnique(
			db.Mood.ID.Equals(moodID),
		).Update(
			db.Mood.Categories.Link(
				db.Category.ID.Equals(categoryID),
			),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Kategori ruh haline atanamadı: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Kategori ruh haline başarıyla atandı", "mood": updatedMood})
	}
}

// RemoveCategoryFromMood removes a category from a mood for the authenticated user
func RemoveCategoryFromMood(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		moodID, err := strconv.Atoi(c.Param("moodId"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz ruh hali ID'si"})
			return
		}

		categoryID, err := strconv.Atoi(c.Param("categoryId"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz kategori ID'si"})
			return
		}

		userID, err := getUserIDFromContext(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		// Verify that both mood and category belong to the user
		mood, err := client.Mood.FindFirst(
			db.Mood.ID.Equals(moodID),
			db.Mood.UserID.Equals(userID),
		).With(
			db.Mood.Categories.Fetch(),
		).Exec(c.Request.Context())

		if err != nil || mood == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Ruh hali bulunamadı veya kullanıcıya ait değil"})
			return
		}

		category, err := client.Category.FindFirst(
			db.Category.ID.Equals(categoryID),
			db.Category.UserID.Equals(userID),
		).Exec(c.Request.Context())

		if err != nil || category == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Kategori bulunamadı veya kullanıcıya ait değil"})
			return
		}

		// Check if the category is assigned to the mood
		categoryFound := false
		for _, existingCategory := range mood.Categories() {
			if existingCategory.ID == categoryID {
				categoryFound = true
				break
			}
		}

		if !categoryFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Bu kategori ruh haline atanmamış"})
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
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Kategori ruh halinden kaldırılamadı: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Kategori ruh halinden başarıyla kaldırıldı"})
	}
}

// getUserIDFromContext extracts and validates the user ID from the context
func getUserIDFromContext(c *gin.Context) (int, error) {
	userID, exists := c.Get("user_id")
	if !exists {
		return 0, errors.New("Kullanıcı kimliği bağlamda bulunamadı")
	}

	// Convert uint to int
	userIDInt := int(userID.(uint))
	return userIDInt, nil
}
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

// CreateCategory creates a new category
func CreateCategory(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input CategoryInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		createdCategory, err := client.Category.CreateOne(
			db.Category.Name.Set(input.Name),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Kategori oluşturulamadı: " + err.Error()})
			return
		}

		c.JSON(http.StatusCreated, createdCategory)
	}
}

// GetCategories returns all categories
func GetCategories(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		categories, err := client.Category.FindMany().Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Kategoriler getirilemedi: " + err.Error()})
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
			c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz kategori ID'si"})
			return
		}

		category, err := client.Category.FindUnique(
			db.Category.ID.Equals(categoryID),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Kategori bulunamadı"})
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
			c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz girdi: " + err.Error()})
			return
		}

		categoryID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz kategori ID'si"})
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

// DeleteCategory deletes a category
func DeleteCategory(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		categoryID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz kategori ID'si"})
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

// GetFoodsByCategory returns all foods for a specific category
func GetFoodsByCategory(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		categoryID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz kategori ID'si"})
			return
		}

		foods, err := client.Food.FindMany(
			db.Food.CategoryID.Equals(categoryID),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Yiyecekler getirilemedi: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, foods)
	}
}

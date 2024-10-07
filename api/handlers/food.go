package handler

import (
	"api/prisma/db"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type FoodInput struct {
	Name       string `json:"name" binding:"required"`
	Calories   int    `json:"calories" binding:"required"`
	CategoryID int    `json:"categoryId" binding:"required"`
}

func CreateFood(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input FoodInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
			return
		}

		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
			return
		}

		userIDInt := int(userID.(uint))

		// Check if category exists and belongs to the user
		category, err := client.Category.FindFirst(
			db.Category.ID.Equals(input.CategoryID),
			db.Category.UserID.Equals(userIDInt),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Category not found or does not belong to the user"})
			return
		}

		// Create food
		food, err := client.Food.CreateOne(
			db.Food.Name.Set(input.Name),
			db.Food.Calories.Set(input.Calories),
			db.Food.User.Link(
				db.User.ID.Equals(userIDInt),
			),
			db.Food.Category.Link(
				db.Category.ID.Equals(category.ID),
			),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create food: " + err.Error()})
			return
		}

		c.JSON(http.StatusCreated, food)
	}
}

func GetFoods(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
			return
		}

		foods, err := client.Food.FindMany(
			db.Food.User.Where(
				db.User.ID.Equals(int(userID.(uint))),
			),
		).With(
			db.Food.Category.Fetch(),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch foods"})
			return
		}

		c.JSON(http.StatusOK, foods)
	}
}

func UpdateFood(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input FoodInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
			return
		}

		foodID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid food ID"})
			return
		}

		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
			return
		}

		userIDInt := int(userID.(uint))

		// Check if food exists and belongs to the user
		existingFood, err := client.Food.FindFirst(
			db.Food.ID.Equals(foodID),
			db.Food.User.Where(
				db.User.ID.Equals(userIDInt),
			),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Food not found or does not belong to the user"})
			return
		}

		// Update food
		updatedFood, err := client.Food.FindUnique(
			db.Food.ID.Equals(existingFood.ID),
		).Update(
			db.Food.Name.Set(input.Name),
			db.Food.Calories.Set(input.Calories),
			db.Food.Category.Link(
				db.Category.ID.Equals(input.CategoryID),
			),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update food: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, updatedFood)
	}
}

func DeleteFood(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		foodID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid food ID"})
			return
		}

		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
			return
		}

		userIDInt := int(userID.(uint))

		// Check if food exists and belongs to the user
		existingFood, err := client.Food.FindFirst(
			db.Food.ID.Equals(foodID),
			db.Food.User.Where(
				db.User.ID.Equals(userIDInt),
			),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Food not found or does not belong to the user"})
			return
		}

		// Delete food
		_, err = client.Food.FindUnique(
			db.Food.ID.Equals(existingFood.ID),
		).Delete().Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete food: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Food deleted successfully"})
	}
}

package handler

import (
	"api/prisma/db"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type FoodInput struct {
	Name       string `json:"name" binding:"required"`
	Calories   int    `json:"calories" binding:"required"`
	CategoryID int    `json:"categoryId" binding:"required"`
}

type UserFoodInput struct {
	FoodID   int       `json:"foodId" binding:"required"`
	Quantity int       `json:"quantity" binding:"required"`
	EatenAt  time.Time `json:"eatenAt" binding:"required"`
}

// CreateFood adds a new food item to the global catalog
func CreateFood(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input FoodInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
			return
		}

		// Check if category exists
		category, err := client.Category.FindUnique(
			db.Category.ID.Equals(input.CategoryID),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
			return
		}

		// Check if food already exists
		existingFood, err := client.Food.FindFirst(
			db.Food.Name.Equals(input.Name),
		).Exec(c.Request.Context())

		if err == nil && existingFood != nil {
			// Food already exists, return it instead of creating a new one
			c.JSON(http.StatusOK, existingFood)
			return
		}

		// Create food
		food, err := client.Food.CreateOne(
			db.Food.Name.Set(input.Name),
			db.Food.Calories.Set(input.Calories),
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

// GetFoods fetches all food items from the global catalog, filtered by category if provided
func GetFoods(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		categoryIDStr := c.Query("categoryId")
		var foods []db.FoodModel
		var err error

		if categoryIDStr != "" {
			categoryID, err := strconv.Atoi(categoryIDStr)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
				return
			}

			foods, err = client.Food.FindMany(
				db.Food.Category.Where(
					db.Category.ID.Equals(categoryID),
				),
			).With(
				db.Food.Category.Fetch(),
			).Exec(c.Request.Context())
		} else {
			foods, err = client.Food.FindMany().With(
				db.Food.Category.Fetch(),
			).Exec(c.Request.Context())
		}

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch foods"})
			return
		}

		c.JSON(http.StatusOK, foods)
	}
}

// UpdateFood updates a food item in the global catalog
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

		// Check if food exists
		existingFood, err := client.Food.FindUnique(
			db.Food.ID.Equals(foodID),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Food not found"})
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

// DeleteFood deletes a food item from the global catalog
func DeleteFood(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		foodID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid food ID"})
			return
		}

		// Delete food
		_, err = client.Food.FindUnique(
			db.Food.ID.Equals(foodID),
		).Delete().Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete food: " + err.Error()})
			return
		}

		c.Status(http.StatusNoContent)
	}
}

// AddUserFood adds a new user food entry
func AddUserFood(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input UserFoodInput
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

		// Check if the food exists
		_, err := client.Food.FindUnique(
			db.Food.ID.Equals(input.FoodID),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Food not found"})
			return
		}

		// Create user food entry
		userFood, err := client.UserFood.CreateOne(
			db.UserFood.User.Link(
				db.User.ID.Equals(userIDInt),
			),
			db.UserFood.Food.Link(
				db.Food.ID.Equals(input.FoodID),
			),
			db.UserFood.Quantity.Set(input.Quantity),
			db.UserFood.EatenAt.Set(input.EatenAt),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user food entry: " + err.Error()})
			return
		}

		c.JSON(http.StatusCreated, userFood)
	}
}

// GetUserFoodsByDate fetches user food entries for a specific date
func GetUserFoodsByDate(client *db.PrismaClient) gin.HandlerFunc {
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

		startOfDay := date.Truncate(24 * time.Hour)
		endOfDay := startOfDay.Add(24 * time.Hour)

		userFoods, err := client.UserFood.FindMany(
			db.UserFood.User.Where(
				db.User.ID.Equals(int(userID.(uint))),
			),
			db.UserFood.EatenAt.Gte(startOfDay),
			db.UserFood.EatenAt.Lt(endOfDay),
		).With(
			db.UserFood.Food.Fetch().With(
				db.Food.Category.Fetch(),
			),
		).Exec(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user foods"})
			return
		}

		c.JSON(http.StatusOK, userFoods)
	}
}

// AddMultipleUserFoods allows adding multiple user food entries
func AddMultipleUserFoods(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		var inputs []UserFoodInput
		if err := c.ShouldBindJSON(&inputs); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
			return
		}

		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
			return
		}

		userIDInt := int(userID.(uint))
		var createdUserFoods []db.UserFoodModel

		for _, input := range inputs {
			// Check if the food exists
			_, err := client.Food.FindUnique(
				db.Food.ID.Equals(input.FoodID),
			).Exec(c.Request.Context())

			if err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Food not found"})
				return
			}

			// Create user food entry
			userFood, err := client.UserFood.CreateOne(
				db.UserFood.User.Link(
					db.User.ID.Equals(userIDInt),
				),
				db.UserFood.Food.Link(
					db.Food.ID.Equals(input.FoodID),
				),
				db.UserFood.Quantity.Set(input.Quantity),
				db.UserFood.EatenAt.Set(input.EatenAt),
			).Exec(c.Request.Context())

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user food entry: " + err.Error()})
				return
			}

			createdUserFoods = append(createdUserFoods, *userFood)
		}

		if len(createdUserFoods) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No user foods were created"})
			return
		}

		c.JSON(http.StatusCreated, createdUserFoods)
	}
}
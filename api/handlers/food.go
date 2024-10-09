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

type MultipleFoodInput struct {
	Foods []FoodInput `json:"foods" binding:"required,dive"`
}

// CreateFood adds a new food item
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

		// Check if food already exists for this user
		existingFood, err := client.Food.FindFirst(
			db.Food.Name.Equals(input.Name),
			db.Food.User.Where(
				db.User.ID.Equals(userIDInt),
			),
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

// GetFoods fetches food items for the user, filtered by category if provided
func GetFoods(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
			return
		}

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
				db.Food.User.Where(
					db.User.ID.Equals(int(userID.(uint))),
				),
				db.Food.Category.Where(
					db.Category.ID.Equals(categoryID),
				),
			).With(
				db.Food.Category.Fetch(),
			).Exec(c.Request.Context())
		} else {
			foods, err = client.Food.FindMany(
				db.Food.User.Where(
					db.User.ID.Equals(int(userID.(uint))),
				),
			).With(
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

// UpdateFood updates a food item
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

// DeleteFood deletes a food item
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

		c.Status(http.StatusNoContent)
	}
}

// AddMultipleUserFoods allows adding multiple food entries
func AddMultipleUserFoods(client *db.PrismaClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input MultipleFoodInput
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
		var createdOrExistingFoods []db.FoodModel

		for _, foodInput := range input.Foods {
			// Check if category exists and belongs to the user
			category, err := client.Category.FindFirst(
				db.Category.ID.Equals(foodInput.CategoryID),
				db.Category.UserID.Equals(userIDInt),
			).Exec(c.Request.Context())

			if err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Category not found or does not belong to the user for food: " + foodInput.Name})
				return
			}

			// Check if food already exists for this user
			existingFood, err := client.Food.FindFirst(
				db.Food.Name.Equals(foodInput.Name),
				db.Food.User.Where(
					db.User.ID.Equals(userIDInt),
				),
			).Exec(c.Request.Context())

			if err == nil && existingFood != nil {
				// Food already exists, add it to the result without creating a new one
				createdOrExistingFoods = append(createdOrExistingFoods, *existingFood)
				continue
			}

			// Create food if it doesn't exist
			food, err := client.Food.CreateOne(
				db.Food.Name.Set(foodInput.Name),
				db.Food.Calories.Set(foodInput.Calories),
				db.Food.User.Link(
					db.User.ID.Equals(userIDInt),
				),
				db.Food.Category.Link(
					db.Category.ID.Equals(category.ID),
				),
			).Exec(c.Request.Context())

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create food: " + foodInput.Name + ". Error: " + err.Error()})
				return
			}

			createdOrExistingFoods = append(createdOrExistingFoods, *food)
		}

		if len(createdOrExistingFoods) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No foods were created or found"})
			return
		}

		c.JSON(http.StatusOK, createdOrExistingFoods)
	}
}

func GetFoodsByDate(client *db.PrismaClient) gin.HandlerFunc {
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

        foods, err := client.Food.FindMany(
            db.Food.User.Where(
                db.User.ID.Equals(int(userID.(uint))),
            ),
            db.Food.CreatedAt.Gte(startOfDay),
            db.Food.CreatedAt.Lt(endOfDay),
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

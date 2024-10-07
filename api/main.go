package main

import (
	handler "api/handlers"
	"api/middleware"
	"api/prisma/db"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	client := db.NewClient()
	if err := client.Prisma.Connect(); err != nil {
		log.Fatal(err)
	}
	defer func() {
		if err := client.Prisma.Disconnect(); err != nil {
			panic(err)
		}
	}()

	r := gin.Default()

	r.POST("/auth/register", handler.Register(client))
	r.POST("/auth/login", handler.Login(client))
	r.POST("/auth/set-app-password", middleware.AuthMiddleware(), handler.SetAppPassword(client))
	r.POST("/auth/verify-app-password", middleware.AuthMiddleware(), handler.VerifyAppPassword(client))
	r.GET("/auth/check-app-password", middleware.AuthMiddleware(), handler.CheckAppPasswordSet(client))

	protected := r.Group("/", middleware.AuthMiddleware())
	{
		protected.GET("/user", handler.GetUserInfo(client))
		protected.DELETE("/user", handler.DeleteUser(client))
		protected.PUT("/user", handler.UpdateUser(client))

		// Mood routes
		protected.POST("/moods", handler.CreateMood(client))
		protected.GET("/moods", handler.GetMoods(client))
		protected.GET("/moods/:id", handler.GetMoodByID(client))
		protected.DELETE("/moods/:id", handler.DeleteMood(client))
		protected.GET("/moods/date/:date", handler.GetMoodByDate(client))

		// Tag routes
		protected.POST("/tags", handler.CreateTag(client))
		protected.GET("/tags", handler.GetAllTags(client))

		// Category routes
		categoriesGroup := protected.Group("/categories")
		{
			categoriesGroup.POST("", handler.CreateCategory(client))
			categoriesGroup.GET("", handler.GetCategories(client))
			categoriesGroup.GET("/:id", handler.GetCategoryByID(client))
			categoriesGroup.PUT("/:id", handler.UpdateCategory(client))
			categoriesGroup.DELETE("/:id", handler.DeleteCategory(client))
			categoriesGroup.POST("/mood/:moodId/:categoryId", handler.AssignCategoryToMood(client))
			categoriesGroup.DELETE("/mood/:moodId/:categoryId", handler.RemoveCategoryFromMood(client))
		}

		// Food routes
		foodGroup := protected.Group("/foods")
		{
			foodGroup.POST("", handler.CreateFood(client))
			foodGroup.GET("", handler.GetFoods(client))
			foodGroup.PUT("/:id", handler.UpdateFood(client))
			foodGroup.DELETE("/:id", handler.DeleteFood(client))
		}
	}

	r.Run(":8080")
}

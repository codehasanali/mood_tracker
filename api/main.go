package main

import (
	handler "api/handlers"
	"api/middleware"
	"api/prisma/db"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// Prisma istemcisini başlat
	client := db.NewClient()
	if err := client.Prisma.Connect(); err != nil {
		log.Fatal("Database bağlantı hatası:", err)
	}
	defer func() {
		// Prisma istemcisini kapatırken hata yönetimi
		if err := client.Prisma.Disconnect(); err != nil {
			log.Panic("Database bağlantısını kapatma hatası:", err)
		}
	}()

	// Gin framework'u kullanarak router oluştur
	r := gin.Default()

	// Auth routes
	authGroup := r.Group("/auth")
	{
		authGroup.POST("/register", handler.Register(client))
		authGroup.POST("/login", handler.Login(client))
		authGroup.POST("/set-app-password", middleware.AuthMiddleware(), handler.SetAppPassword(client))
		authGroup.POST("/verify-app-password", middleware.AuthMiddleware(), handler.VerifyAppPassword(client))
		authGroup.GET("/check-app-password", middleware.AuthMiddleware(), handler.CheckAppPasswordSet(client))
	}

	// Korunan rotalar, sadece giriş yapmış kullanıcılar erişebilir
	protected := r.Group("/", middleware.AuthMiddleware())
	{
		// User routes
		protected.GET("/user", handler.GetUserInfo(client))
		protected.DELETE("/user", handler.DeleteUser(client))
		protected.PUT("/user", handler.UpdateUser(client))

		// Mood routes
		moodsGroup := protected.Group("/moods")
		{
			moodsGroup.POST("", handler.CreateMood(client))
			moodsGroup.GET("", handler.GetMoods(client))
			moodsGroup.GET("/:id", handler.GetMoodByID(client))
			moodsGroup.DELETE("/:id", handler.DeleteMood(client))
			moodsGroup.GET("/date/:date", handler.GetMoodByDate(client))
		}

		// Tag routes
		tagsGroup := protected.Group("/tags")
		{
			tagsGroup.POST("", handler.CreateTag(client))
			tagsGroup.GET("", handler.GetAllTags(client))
		}

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
			foodGroup.POST("/multiple", handler.AddMultipleUserFoods(client))
			foodGroup.GET("/date/:date", handler.GetFoodsByDate(client))
		}
	}

	// Sunucuyu başlat
	r.Run(":8080")
}

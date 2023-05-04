// Package src
/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"time"
)

// Serve starts the server
func (server *TasteBuddyServer) Serve() {
	////////////////////////////////////////////////////////////////////////
	server.Log("Serve", "Starting Taste-Buddy Server")
	// Finish Initialize App
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// Goroutines
	go func() {
		// Markets must be saved before discounts
		// GoRoutineSaveMarketsToDB(client)
		// Discounts must be saved after markets
		// GoRoutineSaveDiscountsToDB(client)
		// Clean up the recipes
		// GoRoutineCleanUpRecipes(client)
	}()
	// Finish Goroutines
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// Set up gin
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:8080"},
		AllowMethods:     []string{"GET", "POST", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	r.Use(server.CheckSessionTokenMiddleware())
	r.Use(LimitRequestsMiddleware())
	r.Use(server.GenerateJWTMiddleware())

	// API Routes
	apiRoutes := r.Group("/api")

	// Version 1
	v1 := apiRoutes.Group("/v1")
	{
		// Check
		v1.GET("", func(context *gin.Context) {
			context.Status(200)
		})

		// Authentication
		authRoutes := v1.Group("/auth")
		{
			// Check session
			authRoutes.GET("", func(context *gin.Context) {
				server.HandleCheckSessionToken(context)
			})

			// Login
			authRoutes.POST("", func(context *gin.Context) {
				server.HandleBasicAuthentication(context)
			})
		}

		// Users
		userRoutes := v1.Group("/user")
		{
			// Get all users
			userRoutes.GET("", server.CheckJWTMiddleware(AdminLevel), func(context *gin.Context) {
				// server.HandleGetAllUsers(context)
			})

			// Register user
			registerRoutes := userRoutes.Group("/register")
			{
				registerRoutes.POST("", func(context *gin.Context) {
					server.HandleRegisterUser(context)
				})
			}
		}

		// Recipes
		recipeRoutes := v1.Group("/recipe")
		{
			// Get all recipes
			recipeRoutes.GET("", func(context *gin.Context) {
				server.HandleGetAllRecipes(context)
			})

			// Get random recipe
			recipeRoutes.GET("/random", func(context *gin.Context) {
				server.HandleGetRandomRecipe(context)
			})

			// Get recipe by id
			recipeRoutes.GET("/byId/:id", func(context *gin.Context) {
				server.HandleGetRecipeById(context)
			})

			// Get recipe by item ids
			recipeRoutes.GET("/byItem/:itemIds", func(context *gin.Context) {
				server.HandleFindRecipesByItemNames(context)
			})

			// Add recipe to database
			recipeRoutes.POST("", server.CheckJWTMiddleware(ModeratorLevel), func(context *gin.Context) {
				server.HandleAddRecipe(context)
			})

			// Delete recipe by id
			recipeRoutes.DELETE("/:id", server.CheckJWTMiddleware(ModeratorLevel), func(context *gin.Context) {
				server.HandleDeleteRecipeById(context)
			})
		}

		// Items
		itemRoutes := v1.Group("/item")
		{
			// Get list of all items
			itemRoutes.GET("", func(context *gin.Context) {
				server.HandleGetAllItems(context)
			})

			// Get item by id
			itemRoutes.GET("/byId/:id", func(context *gin.Context) {
				server.HandleGetItemById(context)
			})

			// Add recipe to database
			itemRoutes.POST("", server.CheckJWTMiddleware(ModeratorLevel), func(context *gin.Context) {
				server.HandleAddItem(context)
			})

			// Delete item by id
			itemRoutes.DELETE("/:id", server.CheckJWTMiddleware(ModeratorLevel), func(context *gin.Context) {
				server.HandleDeleteItemById(context)
			})
		}

		// Search routes
		searchRoutes := v1.Group("/search")
		{
			// Search
			searchRoutes.POST("", func(context *gin.Context) {
				// server.HandleSearch(context)
			})
		}

		// Discount routes
		discountRoutes := v1.Group("/discount")
		{
			// Get all discounts
			discountRoutes.GET("", func(context *gin.Context) {
				server.HandleGetAllDiscounts(context)
			})

			// Get all discounts by city
			discountRoutes.GET("/:city", func(context *gin.Context) {
				server.HandleGetDiscountsByCity(context)
			})
		}

		// Market routes
		marketRoutes := v1.Group("/market")
		{
			// Get all markets
			marketRoutes.GET("", func(context *gin.Context) {
				server.HandleGetAllMarkets(context)
			})

			// Get all markets by city
			marketRoutes.GET("/:city", func(context *gin.Context) {
				server.HandleGetMarketsByCity(context)
			})
		}

		// Admin routes
		dbRoutes := v1.Group("/db")
		{
			dbRoutes.POST("/dropAll", server.CheckJWTMiddleware(AdminLevel), func(context *gin.Context) {
				server.HandleDropAllCollections(context)
			})
		}
	}

	server.Log("Serve", "DONE preparing server")

	// Start server
	if err := r.Run(":" + server.port); err != nil {
		server.LogError("Serve", err)
		return
	}

	// Finish gin
	////////////////////////////////////////////////////////////////////////
}

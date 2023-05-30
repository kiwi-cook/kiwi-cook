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
	// Set up gin
	r := gin.Default()
	corsConfig := cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
	if server.mode == DEV {
		corsConfig.AllowAllOrigins = false
		corsConfig.AllowOrigins = []string{"http://localhost:8080"}
	}
	r.Use(cors.New(corsConfig))
	r.Use(server.CheckSessionTokenMiddleware())
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
			// Register user
			registerRoutes := userRoutes.Group("/register")
			{
				registerRoutes.POST("", server.CheckServerModeMiddleware(ADMIN), func(context *gin.Context) {
					server.HandleRegisterUser(context)
				})
			}
		}

		// Recipes
		recipeRoutes := v1.Group("/recipe")
		{
			// Get list of all recipes
			recipeRoutes.GET("", func(context *gin.Context) {
				server.HandleGetAllRecipes(context)
			})

			// Get recipe by id
			recipeRoutes.GET("/:id", func(context *gin.Context) {
				server.HandleGetRecipeById(context)
			})

			// Delete recipe by id
			recipeRoutes.DELETE("/:id", server.CheckJWTMiddleware(ModeratorLevel), func(context *gin.Context) {
				server.HandleDeleteRecipeById(context)
			})

			// Add recipe to database
			recipeRoutes.POST("", server.CheckJWTMiddleware(ModeratorLevel), func(context *gin.Context) {
				server.HandleAddRecipe(context)
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
			itemRoutes.GET("/:id", func(context *gin.Context) {
				server.HandleGetItemById(context)
			})

			// Delete item by id
			itemRoutes.DELETE("/:id", server.CheckJWTMiddleware(ModeratorLevel), func(context *gin.Context) {
				server.HandleDeleteItemById(context)
			})

			// Add recipe to database
			itemRoutes.POST("", server.CheckJWTMiddleware(ModeratorLevel), func(context *gin.Context) {
				server.HandleAddItem(context)
			})
		}

		// Suggestions
		searchRoutes := v1.Group("/s")
		{
			// Get suggestions
			searchRoutes.POST("", func(context *gin.Context) {
				server.HandleSuggestion(context)
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

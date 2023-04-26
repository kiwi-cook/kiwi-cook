package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"time"
)

func main() {
	////////////////////////////////////////////////////////////////////////
	// Initialize App
	app := TasteBuddyAppFactory()
	Log("main", "Starting TasteBuddy API")
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
	r.Use(app.CheckSessionTokenMiddleware())
	r.Use(LimitRequestsMiddleware())
	r.Use(app.GenerateJWTMiddleware())

	// API Routes
	apiRoutes := r.Group("/api")

	// Version 1
	v1 := apiRoutes.Group("/v1")
	{
		// Check
		v1.GET("/", func(context *gin.Context) {
			context.Status(200)
		})

		// Authentication
		authRoutes := v1.Group("/auth")
		{
			// Check session
			authRoutes.GET("/", func(context *gin.Context) {
				app.HandleCheckSessionToken(context)
			})

			// Login
			authRoutes.POST("/", func(context *gin.Context) {
				app.HandleBasicAuthentication(context)
			})
		}

		// Users
		userRoutes := v1.Group("/user")
		{
			// Get all users
			userRoutes.GET("/", app.CheckJWTMiddleware(AdminLevel), func(context *gin.Context) {
				// app.HandleGetAllUsers(context)
			})

			// Register user
			registerRoutes := userRoutes.Group("/register")
			{
				registerRoutes.POST("/", func(context *gin.Context) {
					app.HandleRegisterUser(context)
				})
			}
		}

		// Recipes
		recipeRoutes := v1.Group("/recipe")
		{
			// Get all recipes
			recipeRoutes.GET("/", func(context *gin.Context) {
				app.HandleGetAllRecipes(context)
			})

			// Get random recipe
			recipeRoutes.GET("/random", func(context *gin.Context) {
				app.HandleGetRandomRecipe(context)
			})

			// Get recipe by id
			recipeRoutes.GET("/byId/:id", func(context *gin.Context) {
				app.HandleGetRecipeById(context)
			})

			// Get recipe by item ids
			recipeRoutes.GET("/byItem/:itemIds", func(context *gin.Context) {
				app.HandleFindRecipesByItemNames(context)
			})

			// Add recipe to database
			recipeRoutes.POST("/", app.CheckJWTMiddleware(ModeratorLevel), func(context *gin.Context) {
				app.HandleAddRecipe(context)
			})

			// Delete recipe by id
			recipeRoutes.DELETE("/:id", app.CheckJWTMiddleware(ModeratorLevel), func(context *gin.Context) {
				app.HandleDeleteRecipeById(context)
			})
		}

		// Items
		itemRoutes := v1.Group("/item")
		{
			// Get list of all items
			itemRoutes.GET("/", func(context *gin.Context) {
				app.HandleGetAllItems(context)
			})

			// Get item by id
			itemRoutes.GET("/byId/:id", func(context *gin.Context) {
				app.HandleGetItemById(context)
			})

			// Add recipe to database
			itemRoutes.POST("/", app.CheckJWTMiddleware(ModeratorLevel), func(context *gin.Context) {
				app.HandleAddItem(context)
			})

			// Delete item by id
			itemRoutes.DELETE("/:id", app.CheckJWTMiddleware(ModeratorLevel), func(context *gin.Context) {
				app.HandleDeleteItemById(context)
			})
		}

		// Search routes
		searchRoutes := v1.Group("/search")
		{
			// Search
			searchRoutes.POST("/", func(context *gin.Context) {
				app.HandleSearch(context)
			})
		}

		// Discount routes
		discountRoutes := v1.Group("/discount")
		{
			// Get all discounts
			discountRoutes.GET("/", func(context *gin.Context) {
				app.HandleGetAllDiscounts(context)
			})

			// Get all discounts by city
			discountRoutes.GET("/:city", func(context *gin.Context) {
				app.HandleGetDiscountsByCity(context)
			})
		}

		// Market routes
		marketRoutes := v1.Group("/market")
		{
			// Get all markets
			marketRoutes.GET("/", func(context *gin.Context) {
				app.HandleGetAllMarkets(context)
			})

			// Get all markets by city
			marketRoutes.GET("/:city", func(context *gin.Context) {
				app.HandleGetMarketsByCity(context)
			})
		}

		// Admin routes
		dbRoutes := v1.Group("/db")
		{
			dbRoutes.POST("/dropAll", app.CheckJWTMiddleware(AdminLevel), func(context *gin.Context) {
				app.HandleDropAllCollections(context)
			})
		}
	}

	Log("main", "DONE preparing server")

	// Start server
	err := r.Run(":" + app.port)
	if err != nil {
		LogError("main", err)
		return
	}

	// Finish gin
	////////////////////////////////////////////////////////////////////////
}

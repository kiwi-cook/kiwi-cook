package main

import (
	"fmt"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
)

func main() {
	////////////////////////////////////////////////////////////////////////
	// Initialize App
	app := TasteBuddyAppFactory()
	Log("main", "Starting TasteBuddy API")
	// Finish Initialize App
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// Set up viper
	// Use viper to handle different environments
	viper.AddConfigPath(".")
	viper.AutomaticEnv()
	viper.SetConfigFile(".env")
	if err := viper.ReadInConfig(); err != nil {
		fmt.Printf("fatal error config file, %s", err)
	}

	// Set database connection string
	var DbConnectionString = viper.GetString("DB_CONNSTRING")

	// Set port
	var PORT string
	if viper.GetString("PORT") == "" {
		PORT = "8081"
	} else {
		PORT = viper.GetString("PORT")
	}

	// Finish viper
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// Connect to database
	client, err := ConnectToDatabase(DbConnectionString)
	if err != nil {
		return
	}
	// Register database client
	app.SetDatabase(client)
	// Finish Database
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// Goroutines
	go func() {
		// Markets must be saved before discounts
		GoRoutineSaveMarketsToDB(client)
		// Discounts must be saved after markets
		GoRoutineSaveDiscountsToDB(client)
		// Clean up the recipes
		GoRoutineCleanUpRecipes(client)
	}()
	// Finish Goroutines
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// Set up gin
	r := gin.Default()
	r.Use(cors.Default())
	// r.Use(Authentication())

	// Routes
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
			// Login
			authRoutes.POST("/login", func(context *gin.Context) {
				app.HandleLogin(context)
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
			recipeRoutes.POST("/", func(context *gin.Context) {
				app.HandleAddRecipe(context)
			})

			// Delete recipe by id
			recipeRoutes.DELETE("/:id", func(context *gin.Context) {
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
			itemRoutes.POST("/", func(context *gin.Context) {
				app.HandleAddItem(context)
			})

			// Delete item by id
			itemRoutes.DELETE("/:id", func(context *gin.Context) {
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
		adminRoutes := v1.Group("/admin")
		{
			dbRoutes := adminRoutes.Group("/db")
			{
				dbRoutes.GET("/dropAll", func(context *gin.Context) {
					app.HandleDropAllCollections(context)
				})
			}
		}
	}

	Log("main", "DONE preparing server")

	// Start server
	err = r.Run(":" + PORT)
	if err != nil {
		LogError("main", err)
		return
	}

	// Finish gin
	////////////////////////////////////////////////////////////////////////
}

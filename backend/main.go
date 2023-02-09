package main

import (
	"fmt"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
)

func main() {
	////////////////////////////////////////////////////////////////////////
	// Set up viper
	// Use viper to handle different environments
	viper.AddConfigPath(".")
	viper.SetConfigName(".env")
	viper.SetConfigType("env")
	viper.AutomaticEnv()

	// If DEV_ENV is set to docker, then parse environment variables with DOCKER_ prefix
	// e.g. DOCKER_MONGODB_CONNSTRING=...
	if viper.GetString("APP_ENV") == "docker" {
		viper.SetEnvPrefix("DOCKER")
	}

	if err := viper.ReadInConfig(); err != nil {
		panic(fmt.Errorf("fatal error config file: %w", err))
	}
	// Finish viper
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// Connect to database
	client, err := ConnectToMongo(viper.GetString("MONGODB_CONNSTRING"))
	if err != nil {
		return
	}
	// Finish Database
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// Goroutines
	go func() {
		GoRoutineSaveMarketsToDB(client)
		// Discounts must be saved after markets
		GoRoutineSaveDiscountsToDB(client)
	}()
	// Finish Goroutines
	////////////////////////////////////////////////////////////////////////

	////////////////////////////////////////////////////////////////////////
	// Set up gin
	r := gin.Default()
	r.Use(cors.Default())

	// Routes
	apiRoutes := r.Group("/api")

	// Version 1
	v1 := apiRoutes.Group("/v1")

	// Recipes
	recipeRoutes := v1.Group("/recipe")
	{
		// Get all recipes
		recipeRoutes.GET("/", func(context *gin.Context) {
			HandleGetAllRecipes(context, client)
		})

		// Get random recipe
		recipeRoutes.GET("/random", func(context *gin.Context) {
			HandleGetRandomRecipe(context, client)
		})

		// Get recipe by id
		recipeRoutes.GET("/byId/:id", func(context *gin.Context) {
			HandleGetRecipeById(context, client)
		})

		// Get recipe by item ids
		recipeRoutes.GET("/byItem/:itemIds", func(context *gin.Context) {
			HandleFindRecipesByItemNames(context, client)
		})

		// Add recipe to database
		recipeRoutes.POST("/", func(context *gin.Context) {
			HandleAddRecipe(context, client)
		})
	}

	// Items
	itemRoutes := v1.Group("/item")
	{
		// Get list of all items
		itemRoutes.GET("/", func(context *gin.Context) {
			HandleGetAllItems(context, client)
		})

		// Get item by id
		itemRoutes.GET("/byId/:id", func(context *gin.Context) {
			HandleGetItemById(context, client)
		})

		// Add recipe to database
		itemRoutes.POST("/", func(context *gin.Context) {
			HandleAddItem(context, client)
		})
	}

	// Discount routes
	discountRoutes := v1.Group("/discount")
	{
		// Get all discounts
		discountRoutes.GET("/", func(context *gin.Context) {
			HandleGetAllDiscounts(context, client)
		})

		// Get all discounts by city
		discountRoutes.GET("/:city", func(context *gin.Context) {
			HandleGetDiscountsByCity(context, client)
		})
	}

	// Market routes
	marketRoutes := v1.Group("/market")
	{
		// Get all markets
		marketRoutes.GET("/", func(context *gin.Context) {
			HandleGetAllMarkets(context, client)
		})

		// Get all markets by city
		marketRoutes.GET("/:city", func(context *gin.Context) {
			HandleGetMarketsByCity(context, client)
		})
	}

	// Admin routes
	adminRoutes := v1.Group("/admin")
	{
		dbRoutes := adminRoutes.Group("/db")
		{
			dbRoutes.GET("/dropAll", func(context *gin.Context) {
				HandleDropAllCollections(context, client)
			})
		}
	}

	log.Print("[main] DONE...")

	// Start server
	err = r.Run(":8081")
	if err != nil {
		log.Print(err)
		return
	}

	// Finish gin
	////////////////////////////////////////////////////////////////////////
}

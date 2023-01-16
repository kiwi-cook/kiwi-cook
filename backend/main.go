package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"strconv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
)

func main() {
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
		panic(fmt.Errorf("Fatal error config file: %w", err))
	}

	r := gin.Default()
	r.Use(cors.Default())

	// Connect to database
	client, err := ConnectToMongo(viper.GetString("MONGODB_CONNSTRING"))
	if err != nil {
		return
	}

	apiRoutes := r.Group("/api")

	v1 := apiRoutes.Group("/v1")

	// Management routes
	// Only for moderators only
	editorRoutes := v1.Group("/editor")
	{
		// Editor
		editorRoutes.GET("/", func(context *gin.Context) {
			context.HTML(200, "editor.html", nil)
		})

		editorRoutes.GET("/list", func(context *gin.Context) {
			context.JSON(200, dataFileNames())
		})
	}

	// Recipes
	recipeRoutes := v1.Group("/recipe")
	{
		// Get all recipes
		recipeRoutes.GET("/", func(context *gin.Context) {
			HandleGetRecipesFromDB(context, client)
		})

		// Add recipe to database
		recipeRoutes.POST("/", func(context *gin.Context) {
			HandleAddRecipeToDB(context, client)
		})

		// Get recipe by item ids
		recipeRoutes.GET("/byItem/:itemIds", func(context *gin.Context) {
			HandleFindRecipesByItemNames(context, client)
		})
	}

	// Items
	itemRoutes := v1.Group("/item")
	{
		// Get list of all items
		itemRoutes.GET("/", func(context *gin.Context) {
			HandleGetItemsFromDB(context, client)
		})

		// Add recipe to database
		itemRoutes.POST("/", func(context *gin.Context) {
			HandleAddItemToDB(context, client)
		})
	}

	// Users
	userRoutes := v1.Group("/user")
	{
		// Add an user
		userRoutes.POST("/", func(context *gin.Context) {
			var newUser User
			context.BindJSON(&newUser)
			AddUser(newUser.Username, newUser.Password)
			context.String(200, "Added user")
		})

		userRoutes.GET("/:id", func(context *gin.Context) {
			id, err := strconv.Atoi(context.Param("id"))
			if err == nil {
				context.JSON(200, FindUserById(id))
			}
		})
	}

	// Discount routes
	discountRoutes := v1.Group("/discount")
	{
		discountRoutes.GET("market/:city", func(context *gin.Context) {
			HandleGetMarkets(context)
		})

		discountRoutes.GET("/:city", func(context *gin.Context) {
			HandleGetDiscounts(context, client)
		})
	}

	adminRoutes := v1.Group("/admin")
	{
		dbRoutes := adminRoutes.Group("/db")
		{
			dbRoutes.GET("/addIndex", func(context *gin.Context) {
				HandleCreateDiscountsIndex(context, client)
			})
		}
	}

	err = r.Run(":8081")
	if err != nil {
		log.Print(err)
		return
	}
}

func dataFileNames() []string {
	files, err := ioutil.ReadDir("./.data")
	if err != nil {
		log.Fatal(err)
	}

	names := []string{}
	for _, f := range files {
		names = append(names, f.Name())
	}
	return names
}

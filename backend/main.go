package main

import (
	"io/ioutil"
	"log"
	"strconv"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// Serve frontend static files
	r.LoadHTMLGlob(".page/*.html")

	// Connect to database
	client := ConnectToMongo()

	apiRoutes := r.Group("/api")

	v1 := apiRoutes.Group("/v1")

	// Management routes
	// Only for moderators only
	editorRoutes := v1.Group("/editor")
	{
		// Editor
		editorRoutes.GET("/", func(c *gin.Context) {
			c.HTML(200, "editor.html", nil)
		})

		editorRoutes.GET("/list", func(c *gin.Context) {
			c.JSON(200, dataFileNames())
		})
	}

	// Recipes
	recipeRoutes := v1.Group("/recipe")
	{
		// Get all recipes
		recipeRoutes.GET("/", func(c *gin.Context) {
			c.JSON(200, GetRecipesFromDB(client))
		})

		// Add recipe to database
		recipeRoutes.POST("/", func(c *gin.Context) {
			var newRecipe Recipe
			err := c.BindJSON(&newRecipe)
			if err != nil {
				log.Fatal(err)
			}
			c.JSON(200, AddRecipeToDB(client, newRecipe))
		})

		// Get recipe by item ids
		recipeRoutes.GET("/byItem/:itemIds", func(c *gin.Context) {
			itemIds := c.Param("itemIds")
			c.JSON(200, FindRecipesByItemNames(client, itemIds))
		})
	}

	// Items
	itemRoutes := v1.Group("/item")
	{
		// Get list of all items
		itemRoutes.GET("/", func(c *gin.Context) {
			c.JSON(200, GetItemsFromDB(client))
		})
	}

	// Users
	userRoutes := v1.Group("/user")
	{
		// Add an user
		userRoutes.POST("/", func(c *gin.Context) {
			var newUser User
			c.BindJSON(&newUser)
			AddUser(newUser.Username, newUser.Password)
			c.String(200, "Added user")
		})

		userRoutes.GET("/:id", func(c *gin.Context) {
			id, err := strconv.Atoi(c.Param("id"))
			if err == nil {
				c.JSON(200, FindUserById(id))
			}
		})
	}

	// Discount routes
	discountRoutes := v1.Group("/discount")
	{
		discountRoutes.GET("market/:city", func(c *gin.Context) {
			city := c.Param("city")
			c.JSON(200, GetMarkets(city))
		})

		discountRoutes.GET("/:city", func(c *gin.Context) {
			city := c.Param("city")
			c.JSON(200, GetDiscountsFromDBOrAPI(client, city))
		})
	}

	adminRoutes := v1.Group("/admin")
	{
		dbRoutes := adminRoutes.Group("/db")
		{
			dbRoutes.GET("/addIndex", func(c *gin.Context) {
				CreateDiscountsIndex(client)
			})
		}
	}

	err := r.Run(":8081")
	if err != nil {
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

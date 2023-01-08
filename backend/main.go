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

	// Load json
	LoadRecipes()
	LoadItems()

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
		// Get list of all recipes
		recipeRoutes.GET("/", func(c *gin.Context) {
			c.JSON(200, GetAllRecipes(client))
		})

		recipeRoutes.POST("/", func(c *gin.Context) {
			var newRecipe Recipe
			err := c.BindJSON(&newRecipe)
			if err != nil {
				log.Fatal(err)
			}
			AddRecipe(client, newRecipe)
			// c.JSON(200, GetAllRecipes(client))
		})

		// Replace all recipes
		recipeRoutes.POST("/replaceAll", func(c *gin.Context) {
			var newRecipes []Recipe
			err := c.BindJSON(&newRecipes)
			if err != nil {
				log.Fatal(err)
			}
			ReplaceRecipes(newRecipes)
			c.Status(200)
		})

		recipeRoutes.GET("/byItem/:name", func(c *gin.Context) {
			name := c.Param("name")
			c.JSON(200, FindRecipesByItems(ItemNameToItem([]string{name})))
		})
	}

	// Items
	itemRoutes := v1.Group("/item")
	{
		// Get list of all items
		itemRoutes.GET("/", func(c *gin.Context) {
			c.JSON(200, items)
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

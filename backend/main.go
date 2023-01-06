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

	// Management routes
	// Only for moderators only
	moderationRoutes := r.Group("/m")
	{
		editorRoutes := moderationRoutes.Group("/editor")

		// Editor
		editorRoutes.GET("/", func(c *gin.Context) {
			c.HTML(200, "editor.html", nil)
		})

		editorRoutes.GET("/list", func(c *gin.Context) {
			c.JSON(200, dataFileNames())
		})

		// Recipes
		recipeRoutes := moderationRoutes.Group("/recipes")

		// Get list of all recipes
		recipeRoutes.GET("/", func(c *gin.Context) {
			c.JSON(200, recipes)
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

		// Items
		itemRoutes := moderationRoutes.Group("/items")

		// Get list of all items
		itemRoutes.GET("/", func(c *gin.Context) {
			c.JSON(200, items)
		})

		// Users
		userRoutes := moderationRoutes.Group("/users")

		// Add an user
		userRoutes.POST("/", func(c *gin.Context) {
			var newUser User
			c.BindJSON(&newUser)
			AddUser(newUser.Username, newUser.Password)
			c.String(200, "Added user")
		})
	}

	// Recipes routes
	recipeRoutes := r.Group("/recipe")
	{
		recipeRoutes.GET("/byItem/:name", func(c *gin.Context) {
			name := c.Param("name")
			c.JSON(200, FindRecipesByItems(ItemNameToItem([]string{name})))
		})
	}

	// User routes
	userRoutes := r.Group("/user")
	{
		userRoutes.GET("/", func(c *gin.Context) {
			c.String(200, "Try /user/1")
		})

		userRoutes.GET("/:id", func(c *gin.Context) {
			id, err := strconv.Atoi(c.Param("id"))
			if err == nil {
				c.JSON(200, FindUserById(id))
			}
		})
	}

	err := r.Run()
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

package main

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// Serve frontend static files
	r.LoadHTMLGlob(".page/*.html")

	// Management routes
	// Only for moderators only
	moderationRoutes := r.Group("/m")
	{
		// Editor
		moderationRoutes.GET("/editor", func(c *gin.Context) {
			c.HTML(200, "editor.html", nil)
		})

		// Recipes
		recipeRoutes := moderationRoutes.Group("/recipe")

		// Get list of all recipes
		recipeRoutes.GET("/", func(c *gin.Context) {
			c.JSON(200, recipes)
		})

		// Add a recipe
		recipeRoutes.POST("/", func(c *gin.Context) {
			var newRecipe Recipe
			c.BindJSON(&newRecipe)
			AddRecipe(newRecipe)
			c.JSON(200, recipes)
		})

		// Update a recipe
		recipeRoutes.PUT("/", func(c *gin.Context) {
			// not implemented yet
			c.AbortWithStatus(501)
		})

		// Items
		itemRoutes := moderationRoutes.Group("/item")

		// Get list of all items
		itemRoutes.GET("/", func(c *gin.Context) {
			c.JSON(200, items)
		})

		// Users
		userRoutes := moderationRoutes.Group("/user")

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

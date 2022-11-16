package main

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// Management routes
	// Only for >= moderators only
	managementRoutes := r.Group("/manag")
	{
		// Recipes
		recipeRoutes := managementRoutes.Group("/recipe")

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

		// Users
		userRoutes := r.Group("/user")

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

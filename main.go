package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.GET("/", func(c *gin.Context) {
		c.String(200, "Try /recipes or /recipesByItem/egg for all recipes with egg")
	})

	r.GET("/recipes", func(c *gin.Context) {
		c.JSON(200, recipes)
	})

	r.GET("/recipesByItem/:name", func(c *gin.Context) {
		name := c.Param("name")
		c.JSON(200, FindRecipesByItems(ItemNameToItem([]string{name})))
	})

	err := r.Run()
	if err != nil {
		return
	}
}

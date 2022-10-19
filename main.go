package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.GET("/recipes", func(c *gin.Context) {
		c.String(200, recipesToString(recipes))
	})
	r.GET("/recipes/:id", func(c *gin.Context) {
		id := c.Param("id")
		c.String(200, recipeToString())
	})

	err := r.Run()
	if err != nil {
		return
	} // listen and serve on
}

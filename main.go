package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.GET("/recipes", func(c *gin.Context) {
		c.JSON(200, RecipesToString(recipes))
	})

	r.GET("/findByItems", func(c *gin.Context) {
		c.JSON(200, FindRecipesByItems(ItemNameToItem([]string{""})))
	})
	err := r.Run()
	if err != nil {
		return
	} // listen and serve on
}

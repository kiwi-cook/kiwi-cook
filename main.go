package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.GET("/recipes", func(c *gin.Context) {
		c.String(200, recipesToString(recipes))
	})

	err := r.Run()
	if err != nil {
		return
	} // listen and serve on
}

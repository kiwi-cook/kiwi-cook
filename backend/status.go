package main

import (
	"math/rand"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (context *TasteBuddyContext) Success(message string) {
	context.JSON(http.StatusOK, gin.H{"success": message})
}

func (context *TasteBuddyContext) SuccessJSON(json interface{}) {
	context.JSON(http.StatusOK, json)
}

func (context *TasteBuddyContext) NotFoundError(itemName string) {
	context.JSON(http.StatusNotFound, gin.H{"error": itemName + " not found."})
}

func (context *TasteBuddyContext) BadRequestError(message string) {
	context.JSON(http.StatusBadRequest, gin.H{"error": message})
}

func (context *TasteBuddyContext) ServerError(funny bool) {
	var message string
	if funny {
		message = funnyErrorMessage()
	} else {
		message = "Internal Server ErrorMessage"
	}
	context.ErrorMessage(message)
}

func (context *TasteBuddyContext) ErrorMessage(message string) {
	context.JSON(http.StatusInternalServerError, gin.H{"error": message})
}

func funnyErrorMessage() string {
	messages := []string{
		"WTH are you trying to do?",
		"Oh Lord, we're being hacked!",
		"Nope.",
		"Stop it!",
		"We lost him",
		"Hello, this is Microsoft Tech support. How can I help you?",
		"Beep boop. This is an error.",
		"Oh My God! You killed Kenny!",
	}

	randomIndex := rand.Intn(len(messages))
	return messages[randomIndex]
}

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
	funnyMessages := []string{
		"Looks like you're trying to break the internet again. Please stop, it's already had a rough year.",
		"Oh Lord, we're being hacked! 😱 Call the FBI!",
		"Hello, this is Microsoft Tech support. How can I help you?",
		"Beep boop. This is an error. Boop beep! 🤖",
		"Oh My God! You killed Kenny!",
		"Something happened. We're not sure what, but something happened.",
		"Looks like you're barking up the wrong API! Try another endpoint.",
		"Oh no! The server is feeling a bit overwhelmed. Give it a minute to catch its breath.",
		"Whoops! It seems our hamsters powering the server just took a coffee break. Try again in a few minutes.",
		"ERROR 404: Wisdom not found. Please try a different endpoint.",
		"Looks like the squirrels running our database went on strike. Try again later.",
		"We're sorry, but your request has been lost in space. Literally. Please try again.",
		"Error: Cannot divide by zero. We're pretty sure even the universe can't handle that.",
		"Uh-oh! We couldn't find what you were looking for. Maybe try using a telescope?",
		"Error: Insufficient caffeine levels detected. Our developers are working on a fix.",
		"Oops! Our servers seem to be experiencing some technical difficulties. But don't worry, we've sent in the clowns to fix it.",
		"Error: Your request was a little too wild for our servers to handle. Please try again with a tamer request.",
		"We apologize for the inconvenience, but our server is currently on vacation. Try again when it gets back.",
		"Oops! Looks like our developers forgot to pay the internet bill. Try again later when we have Wi-Fi again.",
		"Error: Your request made our servers go bananas. Maybe try a less fruity approach?",
		"Uh-oh, looks like we spilled coffee on our servers again. Please stand by while we clean up the mess.",
		"We're sorry, but the data you're looking for seems to have gone missing. Maybe it eloped with a unicorn?",
		"Error: Our hamsters fell off their wheel and the server crashed. We're currently coaxing them back on track.",
		"Looks like you're trying to break the internet again. Please stop, it's already had a rough year.",
		"Error: We couldn't find the page you were looking for. Maybe try turning it off and on again?",
		"We apologize, but our servers are currently in a time-out. They need to think about what they've done.",
	}

	randomIndex := rand.Intn(len(funnyMessages))
	return funnyMessages[randomIndex]
}

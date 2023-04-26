package main

import (
	"math/rand"
	"net/http"

	"github.com/gin-gonic/gin"
)

func responseJSON(response interface{}, error bool) gin.H {
	return gin.H{"response": response, "error": error}
}

// Success returns a 200 success with a message
func Success(context *gin.Context, response interface{}) {
	context.JSON(http.StatusOK, responseJSON(response, false))
}

// Created returns a 201 success with a message
func Created(context *gin.Context, response interface{}) {
	context.JSON(http.StatusCreated, responseJSON(response, false))
}

// BadRequestError returns a 400 error with a message
func BadRequestError(context *gin.Context, response string) {
	context.JSON(http.StatusBadRequest, responseJSON(response, true))
}

// NotAuthenticated returns a 401 error with a message
func NotAuthenticated(context *gin.Context) {
	context.AbortWithStatusJSON(http.StatusUnauthorized, responseJSON("Not authenticated.", true))
}

// MissingRights returns a 401 error with a message
func MissingRights(context *gin.Context) {
	context.AbortWithStatusJSON(http.StatusUnauthorized, responseJSON("Missing rights.", true))
}

// NotFoundError returns a 404 error with a message
func NotFoundError(context *gin.Context, itemName string) {
	context.JSON(http.StatusNotFound, responseJSON(itemName+" not found.", true))
}

// TooManyRequests returns a 429 error with a message
func TooManyRequests(context *gin.Context) {
	context.AbortWithStatusJSON(http.StatusTooManyRequests, responseJSON("Too many requests.", true))
}

// ServerError returns a 500 error with a message
func ServerError(context *gin.Context, funny bool) {
	var message string
	if funny {
		message = funnyErrorMessage()
	} else {
		message = "Internal Server Error"
	}
	ErrorMessage(context, message)
}

// ErrorMessage returns a 500 error with a message
func ErrorMessage(context *gin.Context, message string) {
	context.AbortWithStatusJSON(http.StatusInternalServerError, responseJSON(message, true))
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
		"Error: Our servers are currently experiencing a moment of clarity. Please try again later.",
		"Error: Looks like you sent the wrong request. Don't worry, we won't tell anyone.",
		"Whoops! You just sent a request to a non-existent endpoint. Did you mean to do that or did your cat walk over the keyboard again?",
		"Oops, you seem to have sent a request to the wrong universe. Better luck next time, Interdimensional Voyager.",
		"Error: You sent a request that was too hot to handle. Please let it cool down before trying again.",
		"We're sorry, but the request you sent has caused our servers to burst into song. Please try a more appropriate request next time.",
	}

	randomIndex := rand.Intn(len(funnyMessages))
	return funnyMessages[randomIndex]
}

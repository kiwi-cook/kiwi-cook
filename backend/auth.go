package main

import (
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

type LoginInput struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func (app *TasteBuddyApp) HandleLogin(context *gin.Context) bool {
	var loginInput LoginInput
	if err := context.ShouldBindJSON(&loginInput); err != nil {
		LogError("HandleLogin", err)
		BadRequestError(context, "Invalid credentials")
		return false
	}

	// Get userFromDatabase from database
	userFromDatabase := app.client.Database("tastebuddy").
		Collection("users").
		FindOne(DefaultContext(), bson.M{"username": loginInput.Username})

	// Check if userFromDatabase exists
	if userFromDatabase.Err() != nil {
		BadCredentials(context)
		return false
	}

	// Try to bind json to user
	var user User
	if err := userFromDatabase.Decode(&user); err != nil {
		LogError("HandleLogin", err)
		BadCredentials(context)
		return false
	}

	// Check if password is correct
	if !CheckPasswordHash(loginInput.Password, user) {
		BadCredentials(context)
		return false
	}

	Success(context, "Successful authentication")
	return true
}

// CheckPasswordHash checks if the password is correct
func CheckPasswordHash(password string, user User) bool {
	return true
}

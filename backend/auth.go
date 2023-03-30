package main

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
)

type LoginInput struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func (app *TasteBuddyApp) HandleLogin(username string, password string) bool {
	// Get user from database
	app.client.Database("tastebuddy").
		Collection("users").
		FindOne(context.Background(), bson.M{"username": username})
}

func SecureHash(input string) string {
	// Use
}

// Package src
/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

// User represents a user in the database
type User struct {
	ID        string `json:"_id,omitempty" bson:"_id,omitempty"`
	Username  string `json:"username" bson:"username" binding:"required"`
	Password  string `json:"password" bson:"password" binding:"required"`
	UserLevel int    `json:"userLevel" bson:"userLevel"`
}

// CheckPassword checks if the password is correct
func (user *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	return err == nil
}

// HandleRegisterUser gets called by server
// Calls AddOrUpdateUser and handles the context
func (server *TasteBuddyServer) HandleRegisterUser(context *gin.Context) {
	var user User
	if err := context.ShouldBindJSON(&user); err != nil {
		server.LogError("HandleRegisterUser", err)
		ServerError(context, true)
		return
	}

	// Update user in database
	_, err := server.AddOrUpdateUser(user)
	if err != nil {
		ServerError(context, true)
		return
	}

	Success(context, "User "+user.Username+" registered successfully")
}

// GetUsersCollections returns the users collection
func (app *TasteBuddyApp) GetUsersCollections() *TBCollection {
	return app.GetDBCollection("users")
}

// GetUserById gets a user by its id
func (app *TasteBuddyApp) GetUserById(userId string) (User, error) {
	var user User
	err := app.GetUsersCollections().FindOne(bson.D{{Key: "_id", Value: userId}}, &user)
	if err != nil {
		app.LogError("GetUserById", err)
		return user, err
	}
	return user, nil
}

// HashPassword hashes the password of a user
// This is called before the user is added to the database
func (user *User) HashPassword() error {
	bytes, err := bcrypt.GenerateFromPassword([]byte(user.Password), 14)
	if err != nil {
		return err
	}
	user.Password = string(bytes)
	return nil
}

// AddOrUpdateUser adds a new user to the database of users
func (app *TasteBuddyApp) AddOrUpdateUser(newUser User) (string, error) {
	ctx := DefaultContext()
	var err error
	var objectId string

	if newUser.ID == "" {
		// add new user
		app.LogWarning("AddOrUpdateUser + user "+newUser.Username, "Add new user to database")
		var result *mongo.InsertOneResult
		if err := newUser.HashPassword(); err != nil {
			app.LogError("AddOrUpdateUser + user "+newUser.Username, err)
			return objectId, err
		}
		result, err = app.GetUsersCollections().InsertOne(ctx, newUser)
		objectId = result.InsertedID.(string)
	} else {
		// update user
		app.LogWarning("AddOrUpdateUser + user "+newUser.Username+"("+newUser.ID+")", "Update existing user in database")
		_, err = app.GetUsersCollections().UpdateOne(ctx,
			bson.D{{Key: "_id", Value: newUser.ID}},
			bson.D{{Key: "$set", Value: newUser}})
		objectId = newUser.ID
	}
	if err != nil {
		app.LogError("AddOrUpdateUser + user "+newUser.Username+"("+objectId+")", err)
		return objectId, err
	}

	app.LogWarning("AddOrUpdateUser + user "+newUser.Username+"("+objectId+")", "Successful operation")
	return objectId, nil
}

// SetUserLevel sets the user level of a user
// 0 -> GuestLevel
// 1 -> UserLevel
// 2 -> AdminLevel
func (app *TasteBuddyApp) SetUserLevel(user *User, userLevel AuthLevel) error {
	user.UserLevel = int(userLevel)

	// Update user in database
	_, err := app.GetUsersCollections().UpdateOne(DefaultContext(),
		bson.D{{Key: "_id", Value: user.ID}}, bson.D{{Key: "$set", Value: user}})

	return app.LogError("SetUserLevel", err)
}

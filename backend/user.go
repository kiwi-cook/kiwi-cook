package main

import (
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

// User represents a user in the database
type User struct {
	ID        primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Username  string             `json:"username" bson:"username" binding:"required"`
	Password  string             `json:"password" bson:"password" binding:"required"`
	UserLevel int                `json:"userLevel,omitempty" bson:"userLevel,omitempty"`
}

// CheckPassword checks if the password is correct
func (user *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	return err == nil
}

// HandleRegisterUser gets called by router
// Calls AddOrUpdateUser and handles the context
func (app *TasteBuddyApp) HandleRegisterUser(context *gin.Context) {
	var user User
	if err := context.ShouldBindJSON(&user); err != nil {
		LogError("HandleRegisterUser", err)
		ServerError(context, true)
		return
	}

	// Update user in database
	_, err := app.client.AddOrUpdateUser(user)
	if err != nil {
		ServerError(context, true)
		return
	}

	Success(context, "User "+user.Username+" registered successfully")
}

// GetUsersCollections returns the users collection
func (client *TasteBuddyDatabase) GetUsersCollections() *mongo.Collection {
	return client.Database("tastebuddy").Collection("users")
}

// GetUserById gets a user by its id
func (client *TasteBuddyDatabase) GetUserById(userId primitive.ObjectID) (User, error) {
	var user User
	ctx := DefaultContext()
	err := client.GetUsersCollections().FindOne(ctx, bson.D{{Key: "_id", Value: userId}}).Decode(&user)
	if err != nil {
		LogError("GetUserById", err)
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
func (client *TasteBuddyDatabase) AddOrUpdateUser(newUser User) (primitive.ObjectID, error) {
	ctx := DefaultContext()
	var err error
	var objectId primitive.ObjectID

	if newUser.ID.IsZero() {
		// add new user
		LogWarning("AddOrUpdateUser + user "+newUser.Username, "Add new user to database")
		var result *mongo.InsertOneResult
		if err := newUser.HashPassword(); err != nil {
			LogError("AddOrUpdateUser + user "+newUser.Username, err)
			return objectId, err
		}
		result, err = client.GetUsersCollections().InsertOne(ctx, newUser)
		objectId = result.InsertedID.(primitive.ObjectID)
	} else {
		// update user
		LogWarning("AddOrUpdateUser + user "+newUser.Username+"("+newUser.ID.Hex()+")", "Update existing user in database")
		_, err = client.GetUsersCollections().UpdateOne(ctx,
			bson.D{{Key: "_id", Value: newUser.ID}},
			bson.D{{Key: "$set", Value: newUser}})
		objectId = newUser.ID
	}
	if err != nil {
		LogError("AddOrUpdateUser + user "+newUser.Username+"("+objectId.Hex()+")", err)
		return objectId, err
	}

	LogWarning("AddOrUpdateUser + user "+newUser.Username+"("+objectId.Hex()+")", "Successful operation")
	return objectId, nil
}

// SetUserLevel sets the user level of a user
// 0 -> GuestLevel
// 1 -> UserLevel
// 2 -> AdminLevel
func (client *TasteBuddyDatabase) SetUserLevel(user *User, userLevel AuthLevel) error {
	user.UserLevel = int(userLevel)

	// Update user in database
	_, err := client.GetUsersCollections().UpdateOne(DefaultContext(),
		bson.D{{Key: "_id", Value: user.ID}}, bson.D{{Key: "$set", Value: user}})

	return err
}

package main

import (
	"crypto/rand"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// AuthLevel defines authentication levels as int type / Enum
// This can be interpreted as some type of scope
// and is used to check whether the user has the right to do an action or not
type AuthLevel int

// Define different user levels
const (
	GuestLevel     AuthLevel = iota // Not logged in
	UserLevel                       // Normal user
	ModeratorLevel                  // Moderator can change stuff in the database
	AdminLevel                      // Administrator can do everything
)

// //////////////////////////////////////////////////////////////////////
// Basic Authentication

// BasicAuthInput is used to authenticate users via Username and Password
type BasicAuthInput struct {
	Username string `json:"username" binding:"required" bson:"-"`
	Password string `json:"password" binding:"required" bson:"-"`
}

// HandleBasicAuthentication handles the authentication of a user
func (app *TasteBuddyApp) HandleBasicAuthentication(context *gin.Context) {
	var authInput BasicAuthInput
	if err := context.ShouldBindJSON(&authInput); err != nil {
		LogError("HandleBasicAuthentication", err)
		ServerError(context, true)
		return
	}

	if user, isValidCredentials := app.CheckBasicAuthenticationCredentials(authInput); isValidCredentials {
		// Generate session token for user and set session token cookie
		app.HandleStartSession(context, *user)
		SuccessJSON(context, "Successfully logged in")
	} else {
		// Return error
		NotAuthenticated(context)
	}
}

// CheckBasicAuthenticationCredentials authenticates the user and internally sets the JWT token
//  1. Get the user from the database
//     If not -> return false
//     This saves resources since it takes time to check if the passwords are identical
//  2. Check if the password of the user is correct
//     Hash password and check if the hashed password corresponds the hashed password from the database
//     If not -> return false
//     If yes -> return true
func (app *TasteBuddyApp) CheckBasicAuthenticationCredentials(authInput BasicAuthInput) (*User, bool) {
	// Try to get the user from the database
	userFromDatabase := app.client.
		GetUsersCollections().
		FindOne(DefaultContext(), bson.M{"username": authInput.Username})

	// Check if the user exists
	if userFromDatabase.Err() != nil {
		LogError("CheckBasicAuthenticationCredentials", userFromDatabase.Err())
		return nil, false
	}

	// Try to decode user from database into struct
	var user User
	if err := userFromDatabase.Decode(&user); err != nil {
		LogError("CheckBasicAuthenticationCredentials", err)
		return nil, false
	}

	// Check if password is correct
	if !checkPasswordHash(authInput.Password, user) {
		return nil, false
	}

	return &user, true
}

// checkPasswordHash checks if the password is hashed correctly
func checkPasswordHash(password string, user User) bool {
	return password == user.Password
}

////////////////////////////////////////////////////////////////////////
// Session

// Session is used to store the session of a user
type Session struct {
	SessionToken string             `json:"session_token" bson:"session_token"`
	UserID       primitive.ObjectID `json:"user_id" bson:"user_id"`
	CreatedAt    time.Time          `json:"created_at" bson:"created_at"`
	ExpiresAt    time.Time          `json:"expires_at" bson:"expires_at"`
}

// HandleSessionTokenMiddleware checks if the session is valid
func (app *TasteBuddyApp) HandleSessionTokenMiddleware() gin.HandlerFunc {
	return func(context *gin.Context) {
		Log("HandleSessionTokenMiddleware", "Checking session token...")

		// Check to see if the request has an existing session token
		if cookie, err := context.Request.Cookie("session_token"); err == nil {
			Log("HandleSessionTokenMiddleware", "Found session token cookie: "+cookie.Value)
			sessionToken := cookie.Value
			// Validate the session token
			if app.client.ValidateSessionToken(sessionToken) {
				Log("HandleSessionTokenMiddleware", "Session token is valid")
				// Generate a JWT from the session token
				if JWT, err := app.GenerateJWTFromSessionToken(sessionToken); err == nil {
					// Ignore errors that might occur
					// If there was no error, set the JWT as a context variable
					context.Set("JWT", JWT)
				} else {
					LogError("HandleSessionTokenMiddleware/GenerateJWT", err)
				}
			} else {
				// If the session token is invalid, remove it from the request
				LogError("HandleSessionTokenMiddleware", errors.New("session token is invalid"))
				cookie.MaxAge = -1
				http.SetCookie(context.Writer, cookie)
			}
		}
	}
}

// HandleStartSession starts a session for the user and sets the session token cookie
func (app *TasteBuddyApp) HandleStartSession(context *gin.Context, user User) {
	// Generate session token and save it in the database
	sessionToken, expiresAt, err := app.client.SetSessionForUser(user)
	if err != nil {
		LogError("HandleStartSession", err)
		ServerError(context, true)
		return
	}

	// Generate cookie
	cookie := &http.Cookie{
		Name:    "session_token",
		Value:   sessionToken,
		Expires: expiresAt,
		Path:    "/",
	}

	// Set cookie
	http.SetCookie(context.Writer, cookie)
}

// GetSessionsCollection returns the sessions collection
func (client *TasteBuddyDatabase) GetSessionsCollection() *mongo.Collection {
	return client.Database("tastebuddy").Collection("sessions")
}

// GetSession returns the session by the session token
func (client *TasteBuddyDatabase) GetSession(sessionToken string) *mongo.SingleResult {
	return client.GetSessionsCollection().FindOne(DefaultContext(), bson.M{"session_token": sessionToken})
}

// GetUserBySessionToken returns the user by the session token
func (client *TasteBuddyDatabase) GetUserBySessionToken(sessionToken string) (*User, error) {
	session := client.GetSession(sessionToken)

	// Check if session exists in database
	if session.Err() != nil {
		LogError("GetUserBySessionToken", session.Err())
		return nil, session.Err()
	}

	// Unmarshal session data
	var sessionData Session
	if err := session.Decode(&sessionData); err != nil {
		LogError("GetUserBySessionToken", err)
		return nil, err
	}

	if user, err := client.GetUserById(sessionData.UserID); err != nil {
		LogError("GetUserBySessionToken", err)
		return nil, err
	} else {
		return &user, nil
	}
}

func (client *TasteBuddyDatabase) ValidateSessionToken(sessionToken string) bool {
	// Get session from database
	session := client.GetSession(sessionToken)

	// Check if session exists in database
	if session.Err() != nil {
		LogError("ValidateSessionToken", session.Err())
		return false
	}

	// Unmarshal session data
	var sessionData Session
	if err := session.Decode(&sessionData); err != nil {
		LogError("ValidateSessionToken", err)
		return false
	}

	// Check if session token is expired or created in the future
	if sessionData.ExpiresAt.Before(time.Now()) || sessionData.CreatedAt.After(time.Now()) {
		return false
	}

	// Session is valid
	return true
}

func (client *TasteBuddyDatabase) SetSessionForUser(user User) (string, time.Time, error) {
	sessionToken := generateRandomToken()
	userId := user.ID
	createdAt := time.Now()
	expiresAt := time.Now().Add(14 * 24 * time.Hour)

	// Insert session into database
	_, err := client.GetSessionsCollection().InsertOne(DefaultContext(), bson.M{
		"session_token": sessionToken,
		"user_id":       userId,
		"created_at":    createdAt,
		"expires_at":    expiresAt,
	})

	if err != nil {
		return "", time.Time{}, err
	}

	return sessionToken, expiresAt, nil
}

////////////////////////////////////////////////////////////////////////
// Tokens

// Generation //

// generateRandomToken generates a random string
func generateRandomToken() string {
	length := 256
	b := make([]byte, length)
	read, err := rand.Read(b)
	if err != nil || read != length {
		return ""
	}
	return fmt.Sprintf("%x", b)
}

// GenerateJWTFromSessionToken generates a JWT token for the user
// Used code from https://stackoverflow.com/a/61284284/6604114
func (app *TasteBuddyApp) GenerateJWTFromSessionToken(sessionToken string) (string, error) {
	// Get user from session JWT
	user, err := app.client.GetUserBySessionToken(sessionToken)
	if err != nil {
		LogError("GenerateJWTFromSessionToken/GetSessionToken", err)
		return "", err
	}

	privateKey, err := jwt.ParseRSAPrivateKeyFromPEM(app.jwtSecretKey)
	if err != nil {
		LogError("GenerateJWTFromSessionToken/ParsePrivateKey", err)
		return "", err
	}

	// JWT expires in 1 minute
	ttl := 60 * time.Second
	claims := jwt.MapClaims{
		"iss": "TasteBuddy",
		"exp": time.Now().UTC().Add(ttl).Unix(),
		"data": map[string]string{
			"user_id":    user.ID.Hex(),
			"auth_level": strconv.Itoa(user.UserLevel),
		},
	}
	JWT := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)

	jwtString, err := JWT.SignedString(privateKey)
	if err != nil {
		LogError("GenerateJWTFromSessionToken/Sign", err)
		return "", err
	}

	return jwtString, nil
}

// Validation, Checks, ... //

// CheckJWTTokenMiddleware is a Middleware that checks if the user is allowed to access the route
func (app *TasteBuddyApp) CheckJWTTokenMiddleware(level AuthLevel) gin.HandlerFunc {
	return func(context *gin.Context) {
		// Validate the JWT token.
		JWT := context.GetString("JWT")
		token, isValidToken := app.ParseJWT(JWT)

		// If the token is valid, check the auth level.
		if isValidToken {
			claims, ok := token.Claims.(jwt.MapClaims)
			if ok && token.Valid {
				data := claims["data"].(map[string]interface{})
				// Check if the user has the required auth level
				authLevel, err := strconv.Atoi(data["auth_level"].(string))
				if authLevel < int(level) || err != nil {
					if err != nil {
						LogError("CheckJWTTokenMiddleware", err)
					}
					MissingRights(context)
				} else {
					context.Next()
				}
			}
		} else {
			NotAuthenticated(context)
		}
	}
}

// ParseJWT validates the JWT token
func (app *TasteBuddyApp) ParseJWT(tokenString string) (*jwt.Token, bool) {
	key, err := jwt.ParseRSAPublicKeyFromPEM(app.jwtPublicKey)
	if err != nil {
		LogError("ParseJWT", err)
		return nil, false
	}

	token, err := jwt.Parse(tokenString, func(jwtToken *jwt.Token) (interface{}, error) {
		if _, ok := jwtToken.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected method: %s", jwtToken.Header["alg"])
		}

		return key, nil
	})

	// If there is an error, the token is invalid, return nil and false
	if err != nil {
		LogError("ParseJWT", err)
		return nil, false
	}

	// Check that the token claims are valid
	_, ok := token.Claims.(jwt.MapClaims)
	if ok && token.Valid {
		return token, true
	}
	return token, false
}

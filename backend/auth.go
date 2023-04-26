package main

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
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

// HandleBasicAuthentication handles the authentication of a user
func (app *TasteBuddyApp) HandleBasicAuthentication(context *gin.Context) {
	// Get the basic auth input from the header
	var basicAuthInput = context.Request.Header.Get("Authorization")
	if basicAuthInput == "" {
		NotAuthenticated(context)
		return
	}

	username, password, err := DecodeBasicAuth(basicAuthInput)
	if err != nil {
		LogError("HandleBasicAuthentication", err)
		ServerError(context, true)
		return
	}

	if user, isValidCredentials := app.CheckBasicAuthenticationCredentials(username, password); isValidCredentials {
		// Generate session token for user and set session token cookie
		app.HandleStartSessionForUser(context, *user)
		Success(context, "Successfully logged in")
	} else {
		// Return error
		NotAuthenticated(context)
	}
}

// DecodeBasicAuth decodes the basic auth input
func DecodeBasicAuth(basicAuthInput string) (string, string, error) {
	// Check if "Basic" is in the string
	if !strings.Contains(basicAuthInput, "Basic") {
		LogError("DecodeUsernameAndPassword", errors.New("invalid basic auth input"))
		return "", "", errors.New("invalid basic auth input")
	}

	// Remove "Basic" from the string and trim spaces
	basicAuthInput = strings.TrimSpace(strings.Replace(basicAuthInput, "Basic", "", 1))

	// Decode base64 string
	decoded, err := base64.StdEncoding.DecodeString(basicAuthInput)
	if err != nil {
		LogError("DecodeUsernameAndPassword", err)
		return "", "", err
	}

	// Split username and password
	split := strings.Split(string(decoded), ":")
	if len(split) != 2 {
		LogError("DecodeUsernameAndPassword", errors.New("invalid basic auth input"))
		return "", "", errors.New("invalid basic auth input")
	}

	return split[0], split[1], nil
}

// CheckBasicAuthenticationCredentials authenticates the user and internally sets the JWT token
//  1. Get the user from the database
//     If not -> return false
//     This saves resources since it takes time to check if the passwords are identical
//  2. Check if the password of the user is correct
//     Hash password and check if the hashed password corresponds the hashed password from the database
//     If not -> return false
//     If yes -> return true
func (app *TasteBuddyApp) CheckBasicAuthenticationCredentials(username, password string) (*User, bool) {
	// Try to get the user from the database
	userFromDatabase := app.client.
		GetUsersCollections().
		FindOne(DefaultContext(), bson.M{"username": username})

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
	if !user.CheckPassword(password) {
		return nil, false
	}

	return &user, true
}

////////////////////////////////////////////////////////////////////////
// Session, JWT and Cookies

// Session is used to store the session of a user
type Session struct {
	SessionToken string             `json:"session_token" bson:"session_token"`
	UserID       primitive.ObjectID `json:"user_id" bson:"user_id"`
	CreatedAt    time.Time          `json:"created_at" bson:"created_at"`
	ExpiresAt    time.Time          `json:"expires_at" bson:"expires_at"`
}

// CheckSessionTokenMiddleware checks if the session is valid
func (app *TasteBuddyApp) CheckSessionTokenMiddleware() gin.HandlerFunc {
	return func(context *gin.Context) {
		cookie, err := context.Request.Cookie("session_token")

		if err != nil {
			context.Next()
			return
		}

		sessionToken := cookie.Value
		// Validate the session token
		isValidSessionToken := app.client.ValidateSessionToken(sessionToken)
		if isValidSessionToken {
			// If the session token is valid, set the session token as a context variable
			context.Set("SessionToken", sessionToken)
		} else {
			LogError("CheckSessionTokenMiddleware", errors.New("session token is invalid"))
		}
		context.Next()
	}
}

// GenerateJWTMiddleware generates a JWT from the session token
func (app *TasteBuddyApp) GenerateJWTMiddleware() gin.HandlerFunc {
	return func(context *gin.Context) {
		// Get the session token from the context
		sessionToken := context.GetString("SessionToken")
		if sessionToken != "" {
			if JWT, err := app.GenerateJWTFromSessionToken(sessionToken); err == nil {
				// Ignore errors that might occur
				// If there was no error, set the JWT as a context variable
				context.Set("JWT", JWT)
			}
		}
		context.Next()
	}
}

// CheckJWTMiddleware is a Middleware that checks whether the user is allowed to access the route
func (app *TasteBuddyApp) CheckJWTMiddleware(level AuthLevel) gin.HandlerFunc {
	return func(context *gin.Context) {
		// Get the internal JWT token.
		JWT := context.GetString("JWT")
		if JWT == "" {
			NotAuthenticated(context)
			return
		}
		// Parse and validate the JWT token.
		token, isValidToken := app.ParseJWT(JWT)
		if !isValidToken {
			NotAuthenticated(context)
			return
		}

		// Parse and validate the claims.
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok || !token.Valid {
			NotAuthenticated(context)
			return
		}

		data := claims["data"].(map[string]interface{})
		// Check if the user has the required auth level
		authLevel, err := strconv.Atoi(data["auth_level"].(string))
		if authLevel < int(level) || err != nil {
			if err != nil {
				LogError("CheckJWTMiddleware", err)
			}
			MissingRights(context)
			return
		}

		// User is authenticated and has the required auth level
		context.Next()
	}
}

// HandleCheckSessionToken checks if the session is valid
func (app *TasteBuddyApp) HandleCheckSessionToken(context *gin.Context) {
	cookie, err := context.Request.Cookie("session_token")

	if err != nil {
		NotAuthenticated(context)
		return
	}

	sessionToken := cookie.Value
	// Validate the session token
	isValidSessionToken := app.client.ValidateSessionToken(sessionToken)
	if isValidSessionToken {
		Success(context, "Session token is valid")
	} else {
		// If the session token is invalid, remove it from the request
		LogError("HandleCheckSessionToken", errors.New("session token is invalid"))
		NotAuthenticated(context)
	}
}

// HandleStartSessionForUser starts a session for the user and sets the session token cookie
func (app *TasteBuddyApp) HandleStartSessionForUser(context *gin.Context, user User) {
	// Generate session token and save it in the database
	sessionToken, expiresAt, maxAge, err := app.client.SetSessionForUser(user)
	if err != nil {
		LogError("HandleStartSessionForUser", err)
		ServerError(context, true)
		return
	}

	// Generate cookie
	cookie := &http.Cookie{
		Name:     "session_token",
		Value:    sessionToken,
		MaxAge:   maxAge,
		Expires:  expiresAt,
		Path:     "/",
		Secure:   false,
		HttpOnly: false,
	}

	// Set cookie
	context.SetCookie(cookie.Name, cookie.Value, cookie.MaxAge, cookie.Path, cookie.Domain, cookie.Secure, cookie.HttpOnly)
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

// SetSessionForUser sets a session for the user
func (client *TasteBuddyDatabase) SetSessionForUser(user User) (string, time.Time, int, error) {
	sessionToken, err := GenerateRandomSessionToken()
	if err != nil {
		return "", time.Time{}, -1, err
	}

	userId := user.ID
	createdAt := time.Now()
	expiresAt := time.Now().Add(14 * 24 * time.Hour)
	maxAge := int(expiresAt.Sub(createdAt).Seconds())

	// Insert session into database
	_, err = client.GetSessionsCollection().InsertOne(DefaultContext(), bson.M{
		"session_token": sessionToken,
		"user_id":       userId,
		"created_at":    createdAt,
		"expires_at":    expiresAt,
	})

	if err != nil {
		return "", time.Time{}, -1, err
	}

	return sessionToken, expiresAt, maxAge, nil
}

// ValidateSessionToken checks if the session token is valid
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

// GenerateRandomSessionToken generates a random string
func GenerateRandomSessionToken() (string, error) {
	// Generate 512 random bits
	tokenBytes := make([]byte, 64)
	if _, err := rand.Read(tokenBytes); err != nil {
		return "", err
	}

	// Encode the random bytes as a base64 string
	token := base64.RawURLEncoding.EncodeToString(tokenBytes)

	return token, nil
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

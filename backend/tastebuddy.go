// Package src
/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"errors"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	"os"
	"strconv"
)

type TasteBuddyApp struct {
	logger       *TasteBuddyLogger
	client       *TasteBuddyDatabase
	jwtSecretKey []byte
	jwtPublicKey []byte
}

// TasteBuddyAppFactory creates a new TasteBuddyApp
func TasteBuddyAppFactory() *TasteBuddyApp {
	return &TasteBuddyApp{}
}

// Default sets up the TasteBuddyApp with default values
func (app *TasteBuddyApp) Default() *TasteBuddyApp {
	return app.
		SetupViper().
		SetLogger("default").
		SetDatabase().
		SetJWTKeys()
}

// SetupViper sets up viper to handle different environments
// Return TasteBuddyApp for chaining
func (app *TasteBuddyApp) SetupViper() *TasteBuddyApp {

	// Check if .env file exists
	if checkIfFileExists(".env") {
		app.Log("SetupViper", "using .env file")
		viper.SetConfigFile(".env")
		viper.AddConfigPath(".")
		if err := viper.ReadInConfig(); err != nil {
			app.FatalError("SetupViper", err)
		}
	}

	viper.AutomaticEnv()
	return app
}

// SetLogger sets the log level
func (app *TasteBuddyApp) SetLogger(logLevel string) *TasteBuddyApp {
	app.logger = &TasteBuddyLogger{LogLevel(logLevel)}
	return app
}

// SetDatabase initializes the database connection and registers the client
func (app *TasteBuddyApp) SetDatabase() *TasteBuddyApp {
	app.LogDebug("SetDatabase", "setting up database connection")

	// Check if DB_URI is set
	if viper.GetString("DB_URI") == "" {
		app.FatalError("SetDatabase", errors.New("DB_URI not set"))
	}
	URI := viper.GetString("DB_URI")

	// Initialize database authentication
	var databaseAuth DatabaseAuth

	if viper.GetString("DB_USER") != "" && viper.GetString("DB_PASSWORD") != "" {
		// Username and password authentication
		username := viper.GetString("DB_USER")
		password := viper.GetString("DB_PASSWORD")
		databaseAuth = DatabaseAuthPW(URI, username, password)
	} else {
		// X509 authentication
		databaseAuth = DatabaseAuthX509(URI)
	}

	// Connect to database
	databaseClient, err := app.ConnectToDatabase(databaseAuth)
	if err != nil {
		app.FatalError("SetDatabase", err)
	}

	// Register database client
	app.client = databaseClient
	return app
}

// SetJWTKeys sets the JWT keys
func (app *TasteBuddyApp) SetJWTKeys() *TasteBuddyApp {
	// Check if JWT keys are set
	if viper.GetString("JWT_RSA_KEY") == "" || viper.GetString("JWT_RSA_PUB_KEY") == "" {
		app.FatalError("SetJWTKeys", errors.New("JWT_RSA_KEY or JWT_RSA_PUB_KEY not set"))
	}

	// Set JWT keys
	var JWTSecretKey = []byte(viper.GetString("JWT_RSA_KEY"))
	var JWTPublicKey = []byte(viper.GetString("JWT_RSA_PUB_KEY"))

	// Check if JWT keys are filepaths
	if checkIfPathIsFile(viper.GetString("JWT_RSA_KEY")) && checkIfPathIsFile(viper.GetString("JWT_RSA_PUB_KEY")) {
		var err error
		// Set JWT secret key
		JWTSecretKey, err = os.ReadFile(viper.GetString("JWT_RSA_KEY"))
		if err != nil {
			app.FatalError("SetJWTKeys", err)
		}
		JWTPublicKey, err = os.ReadFile(viper.GetString("JWT_RSA_PUB_KEY"))
		if err != nil {
			app.FatalError("SetJWTKeys", err)
		}
	}

	// Set JWT keys
	app.jwtSecretKey = JWTSecretKey
	app.jwtPublicKey = JWTPublicKey
	return app
}

func (app *TasteBuddyApp) HasEnvFile() bool {
	return viper.ConfigFileUsed() != ""
}

func (app *TasteBuddyApp) Exit(code int) {
	app.Log("Exit", "exiting with code "+strconv.Itoa(code))
	os.Exit(code)
}

// TasteBuddyServer is the web server

type TasteBuddyServer struct {
	port string
	mode ServerMode
	*TasteBuddyApp
}

type ServerMode string

const (
	PROD  = "prod"
	DEV   = "dev"
	ADMIN = "admin"
)

func TasteBuddyServerFactory(app *TasteBuddyApp) *TasteBuddyServer {
	server := &TasteBuddyServer{}
	server.TasteBuddyApp = app
	return server.SetPort(nil)
}

// SetPort sets the port for the app
// Return TasteBuddyApp for chaining
func (server *TasteBuddyServer) SetPort(port *string) *TasteBuddyServer {
	if viper.GetString("PORT") != "" && port == nil {
		server.port = viper.GetString("PORT")
	} else if port != nil {
		server.port = *port
	} else {
		// Default port
		server.port = "8081"
	}
	return server
}

// SetMode sets the mode for the app
// Return TasteBuddyApp for chaining
func (server *TasteBuddyServer) SetMode(mode string) *TasteBuddyServer {
	switch mode {
	case "dev":
		server.SetLogger("debug")
	case "prod":
		server.SetLogger("default")
	case "admin":
		server.SetLogger("debug")
	default:
		server.SetLogger("debug")
	}

	server.mode = ServerMode(mode)

	return server
}

// CheckServerModeMiddleware checks the server mode
func (server *TasteBuddyServer) CheckServerModeMiddleware(serverMode ServerMode) gin.HandlerFunc {
	return func(context *gin.Context) {
		if (server.mode == ADMIN && serverMode == ADMIN) ||
			(server.mode == DEV && (serverMode == PROD || serverMode == DEV)) ||
			(server.mode == PROD && serverMode == PROD) {
			context.Next()
			return
		}
		ForbiddenError(context)
	}
}

func checkIfPathIsFile(path string) bool {
	info, err := os.Stat(path)
	if err != nil {
		return false
	}
	return !info.IsDir()
}

func checkIfFileExists(path string) bool {
	if _, err := os.ReadFile(path); err != nil {
		return false
	}
	return true
}

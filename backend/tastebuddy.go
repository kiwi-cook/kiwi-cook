// Package src
/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"errors"
	"github.com/spf13/viper"
	"go.mongodb.org/mongo-driver/mongo"
	"os"
)

type TasteBuddyApp struct {
	logLevel     LogLevel
	client       *TasteBuddyDatabase
	jwtSecretKey []byte
	jwtPublicKey []byte
}

type TasteBuddyDatabase struct {
	*mongo.Client
}

// TasteBuddyAppFactory creates a new TasteBuddyApp
func TasteBuddyAppFactory() *TasteBuddyApp {
	app := &TasteBuddyApp{}
	return app.SetupViper().
		SetDatabase(nil).
		SetJWTKeys()
}

// SetupViper sets up viper to handle different environments
// Return TasteBuddyApp for chaining
func (app *TasteBuddyApp) SetupViper() *TasteBuddyApp {
	viper.AddConfigPath(".")
	viper.AutomaticEnv()
	viper.SetConfigFile(".env")
	if err := viper.ReadInConfig(); err != nil {
		app.FatalError("setupViper", err)
	}
	return app
}

// SetLogLevel sets the log level
func (app *TasteBuddyApp) SetLogLevel(logLevel int) *TasteBuddyApp {
	app.logLevel = LogLevel(logLevel)
	return app
}

// SetDatabase initializes the database connection and registers the client
func (app *TasteBuddyApp) SetDatabase(dbConnectionString *string) *TasteBuddyApp {
	DbConnectionString := ""
	if viper.GetString("DB_CONNSTRING") != "" && dbConnectionString == nil {
		DbConnectionString = viper.GetString("DB_CONNSTRING")
	} else if dbConnectionString != nil {
		DbConnectionString = *dbConnectionString
	} else {
		app.FatalError("SetDatabase", errors.New("no database connection string provided"))
	}

	// Connect to database
	databaseClient, err := app.ConnectToDatabase(DbConnectionString)
	if err != nil {
		app.FatalError("SetDatabase", err)
	}

	// Register database client
	app.client = databaseClient
	return app
}

// SetJWTKeys sets the JWT keys
func (app *TasteBuddyApp) SetJWTKeys() *TasteBuddyApp {
	// Set JWT secret key
	JWTSecretKey, err := os.ReadFile(viper.GetString("JWT_RSA_KEY"))
	if err != nil {
		app.FatalError("SetJWTKeys", err)
	}
	JWTPublicKey, err := os.ReadFile(viper.GetString("JWT_RSA_PUB_KEY"))
	if err != nil {
		app.FatalError("SetJWTKeys", err)
	}

	app.jwtSecretKey = JWTSecretKey
	app.jwtPublicKey = JWTPublicKey
	return app
}

type TasteBuddyServer struct {
	port string
	*TasteBuddyApp
}

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

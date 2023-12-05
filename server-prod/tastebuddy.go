// Package src
/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"errors"
	"github.com/spf13/viper"
	"os"
	"strconv"
)

type TasteBuddyApp struct {
	logger *TasteBuddyLogger
	client *TasteBuddyDatabase
}

// TasteBuddyAppFactory creates a new TasteBuddyApp
func TasteBuddyAppFactory() *TasteBuddyApp {
	return &TasteBuddyApp{}
}

// Default sets up the TasteBuddyApp with default values
func (app *TasteBuddyApp) Default() *TasteBuddyApp {
	return app.
		SetLogger("default").
		SetupViper().
		SetDatabase()
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

func (app *TasteBuddyApp) HasEnvFile() bool {
	return viper.ConfigFileUsed() != ""
}

func (app *TasteBuddyApp) Exit(code int) {
	app.Log("Exit", "exiting with code "+strconv.Itoa(code))
	os.Exit(code)
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

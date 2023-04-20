package main

import (
	"errors"
	"github.com/spf13/viper"
	"go.mongodb.org/mongo-driver/mongo"
	"os"
)

type TasteBuddyApp struct {
	port         string
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
		SetPort(nil).
		SetDatebase(nil).
		SetJWTKeys()
}

// SetupViper sets up viper to handle different environments
// Return TasteBuddyApp for chaining
func (app *TasteBuddyApp) SetupViper() *TasteBuddyApp {
	viper.AddConfigPath(".")
	viper.AutomaticEnv()
	viper.SetConfigFile(".env")
	if err := viper.ReadInConfig(); err != nil {
		LogError("setupViper", err)
		FatalError()
	}
	return app
}

// SetPort sets the port for the app
// Return TasteBuddyApp for chaining
func (app *TasteBuddyApp) SetPort(port *string) *TasteBuddyApp {
	if viper.GetString("PORT") != "" && port == nil {
		app.port = viper.GetString("PORT")
	} else if port != nil {
		app.port = *port
	} else {
		// Default port
		app.port = "8081"
	}
	return app
}

func (app *TasteBuddyApp) SetDatebase(dbConnectionString *string) *TasteBuddyApp {
	DbConnectionString := ""
	if viper.GetString("DB_CONNSTRING") != "" && dbConnectionString == nil {
		DbConnectionString = viper.GetString("DB_CONNSTRING")
	} else if dbConnectionString != nil {
		DbConnectionString = *dbConnectionString
	} else {
		LogError("SetDatebase", errors.New("no database connection string provided"))
		FatalError()
	}

	// Connect to database
	databaseClient, err := ConnectToDatabase(DbConnectionString)
	if err != nil {
		LogError("SetDatebase", err)
		FatalError()
	}

	// Register database client
	app.client = databaseClient
	return app
}

func (app *TasteBuddyApp) SetJWTKeys() *TasteBuddyApp {
	// Set JWT secret key
	JWTSecretKey, err := os.ReadFile(viper.GetString("JWT_RSA_KEY"))
	if err != nil {
		LogError("main", err)
		FatalError()
	}
	JWTPublicKey, err := os.ReadFile(viper.GetString("JWT_RSA_PUB_KEY"))
	if err != nil {
		LogError("main", err)
		FatalError()
	}

	app.jwtSecretKey = JWTSecretKey
	app.jwtPublicKey = JWTPublicKey
	return app
}

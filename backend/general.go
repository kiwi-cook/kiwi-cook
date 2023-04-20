package main

import (
	"go.mongodb.org/mongo-driver/mongo"
)

type TasteBuddyApp struct {
	client       *TasteBuddyDatabase
	jwtSecretKey []byte
	jwtPublicKey []byte
}

type TasteBuddyDatabase struct {
	*mongo.Client
}

func TasteBuddyAppFactory() *TasteBuddyApp {
	return &TasteBuddyApp{}
}

func (app *TasteBuddyApp) SetDatabase(database *TasteBuddyDatabase) *TasteBuddyApp {
	app.client = database
	return app
}

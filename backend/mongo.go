package main

import (
	"log"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

func ConnectToDatabase(mongoUri string) (*TasteBuddyDatabase, error) {
	// create new mongo client
	log.Print("Connecting to MongoDB at " + mongoUri + " ...")
	client, err := mongo.NewClient(options.Client().ApplyURI(mongoUri))
	if err != nil {
		log.Print(err)
		return nil, err
	}
	ctx := DefaultContext()

	// connect to MongoDB via mongo client
	err = client.Connect(ctx)
	if err != nil {
		log.Print(err)
		return nil, err
	}

	// try to ping MongoDB to see if connection is established
	err = client.Ping(ctx, readpref.Primary())
	if err != nil {
		log.Print(err)
		return nil, err
	}
	log.Print("Successfully connected to MongoDB")
	return &TasteBuddyDatabase{client}, nil
}

func (app *TasteBuddyApp) HandleDropAllCollections() {
	if err := app.client.DropAll(); err != nil {
		log.Print(err)
		app.context.ServerError(false)
		return
	}
	app.context.Success("Successfully dropped all collections")
}

func (client *TasteBuddyDatabase) DropAll() error {
	ctx := DefaultContext()
	err := client.Database("tastebuddy").Drop(ctx)
	if err != nil {
		log.Print(err)
	}
	return err
}

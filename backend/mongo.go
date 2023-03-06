package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

func ConnectToDatabase(uri string) (*TasteBuddyDatabase, error) {
	// create new mongo client
	log.Print("Connecting to Database at " + uri + " ...")

	credential := options.Credential{
		AuthMechanism: "MONGODB-X509",
	}

	client, err := mongo.NewClient(options.Client().ApplyURI(uri).SetAuth(credential))
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

func (app *TasteBuddyApp) HandleDropAllCollections(context *gin.Context) {
	if err := app.client.DropAll(); err != nil {
		log.Print(err)
		ServerError(context, false)
		return
	}
	Success(context, "Successfully dropped all collections")
}

func (client *TasteBuddyDatabase) DropAll() error {
	ctx := DefaultContext()
	err := client.Database("tastebuddy").Drop(ctx)
	if err != nil {
		log.Print(err)
	}
	return err
}

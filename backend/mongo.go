package main

import (
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
	"log"
)

func ConnectToMongo(mongoUri string) (*mongo.Client, error) {
	// create new mongo client
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
	return client, nil
}

func HandleDropAllCollections(context *gin.Context, client *mongo.Client) {
	if err := dropAll(client); err != nil {
		log.Print(err)
		ServerError(context, false)
		return
	}
	Success(context, "Successfully dropped all collections")
}

func dropAll(client *mongo.Client) error {
	ctx := DefaultContext()
	err := client.Database("tastebuddy").Drop(ctx)
	if err != nil {
		log.Print(err)
	}
	return err
}

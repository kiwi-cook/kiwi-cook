package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
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

func DefaultContext() context.Context {
	ctx, _ := context.WithTimeout(context.Background(), 30*time.Second)
	return ctx
}

func HandleDropAllCollections(context *gin.Context, client *mongo.Client) {
	err := dropAll(client)
	if err != nil {
		log.Print(err)
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}
	context.JSON(http.StatusOK, gin.H{"message": "Successfully dropped all collections"})
}

func dropAll(client *mongo.Client) error {
	ctx := DefaultContext()
	err := client.Database("tastebuddy").Drop(ctx)
	if err != nil {
		log.Print(err)
	}
	return err
}

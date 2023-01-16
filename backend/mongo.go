package main

import (
	"context"
	"log"
	"time"

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

package main

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

func ConnectToMongo() (*mongo.Client, error) {
	client, err := mongo.NewClient(options.Client().ApplyURI(os.Getenv("MONGODB_CONNSTRING")))
	ctx := DefaultContext()
	err = client.Connect(ctx)
	if err != nil {
		log.Print(err)
		return nil, err
	}
	err = client.Ping(ctx, readpref.Primary())
	if err != nil {
		log.Fatal(err)
	}
	return client, nil
}

func DefaultContext() context.Context {
	ctx, _ := context.WithTimeout(context.Background(), 30*time.Second)
	return ctx
}

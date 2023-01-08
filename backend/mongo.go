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

func ConnectToMongo() *mongo.Client {
	client, err := mongo.NewClient(options.Client().ApplyURI(os.Getenv("MONGODB_CONNSTRING")))
	clientContext, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(clientContext)
	if err != nil {
		log.Fatal(err)
	}
	err = client.Ping(clientContext, readpref.Primary())
	if err != nil {
		log.Fatal(err)
	}
	return client
}

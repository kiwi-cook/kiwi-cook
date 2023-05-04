// Package src
// Package src
/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

func (app *TasteBuddyApp) ConnectToDatabase(uri string) (*TasteBuddyDatabase, error) {
	// create new mongo client
	app.Log("ConnectToDatabase", "Connecting to Database at "+uri+" ...")

	credential := options.Credential{
		AuthMechanism: "MONGODB-X509",
	}

	client, err := mongo.NewClient(options.Client().ApplyURI(uri).SetAuth(credential))
	if err != nil {
		return nil, app.LogError("ConnectToDatabase", err)
	}
	ctx := DefaultContext()

	// connect to MongoDB via mongo client
	if err = client.Connect(ctx); err != nil {
		return nil, app.LogError("ConnectToDatabase", err)
	}

	// try to ping MongoDB to see if connection is established
	if err = client.Ping(ctx, readpref.Primary()); err != nil {
		return nil, app.LogError("ConnectToDatabase", err)
	}
	app.Log("ConnectToDatabase", "Successfully connected to MongoDB")
	return &TasteBuddyDatabase{client}, nil
}

func (server *TasteBuddyServer) HandleDropAllCollections(context *gin.Context) {
	if err := server.DropAll(); err != nil {
		server.LogError("HandleDropAllCollections", err)
		ServerError(context, false)
		return
	}
	Success(context, "Successfully dropped all collections")
}

func (app *TasteBuddyApp) DropAll() error {
	ctx := DefaultContext()
	if err := app.client.Database("tastebuddy").Drop(ctx); err != nil {
		return app.LogError("DropAll", err)
	}
	return nil
}

// Package src
// Package src
/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"errors"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

type TasteBuddyDatabase struct {
	*mongo.Client
	*TasteBuddyLogger
	hasError bool
}

type TBCollection struct {
	*mongo.Collection
	*TasteBuddyLogger
	hasError bool
}

func (app *TasteBuddyApp) GetDBCollection(collectionName string) *TBCollection {
	if app.client == nil {
		app.LogError("GetDBCollection", errors.New("mongoDB client is nil"))
		return &TBCollection{nil, app.logger, true}
	}

	// Get the database and collection
	return &TBCollection{app.client.Database("tastebuddy").Collection(collectionName), app.logger, false}
}

func (collection *TBCollection) FindOneWithDefault(filter interface{}, result interface{}, defaultValue interface{}) error {
	singleResult := collection.Collection.FindOne(DefaultContext(), filter)
	if singleResult.Err() != nil {
		result = defaultValue
		return collection.LogError("FindOneWithDefault[FindOne]", singleResult.Err())
	}

	if err := singleResult.Decode(result); err != nil {
		result = defaultValue
		return collection.LogError("FindOneWithDefault[Decode]", err)
	}

	// If no results are found, return the default value
	if result == nil {
		result = defaultValue
	}

	return nil
}

func (collection *TBCollection) FindOne(filter interface{}, result interface{}) error {
	return collection.FindOneWithDefault(filter, result, nil)
}

func (collection *TBCollection) AllWithDefault(filter interface{}, results interface{}, defaultValue interface{}) error {
	if results == nil || filter == nil || collection.Collection == nil {
		collection.hasError = true
		return collection.LogError("AllWithDefault[CheckConnection]", errors.New("cannot process nil values"))
	}

	cursor, err := collection.Collection.Find(DefaultContext(), filter)
	if err != nil {
		collection.hasError = true
		results = defaultValue
		return collection.LogError("AllWithDefault[Find]", err)
	}
	defer cursor.Close(DefaultContext())
	if err = cursor.All(DefaultContext(), results); err != nil {
		collection.hasError = true
		results = defaultValue
	}

	// If no results are found, return the default value
	if results == nil {
		results = defaultValue
	}
	if err != nil {
		return collection.LogError("AllWithDefault[Decode]", err)
	}
	return nil
}

func (collection *TBCollection) All(filter interface{}, results interface{}) error {
	return collection.AllWithDefault(filter, results, nil)
}

type DatabaseAuthMode int

const (
	AuthModePW = iota
	AuthModeX509
)

type DatabaseAuth struct {
	DatabaseAuthMode DatabaseAuthMode
	URI              string
	Username         string
	Password         string
}

func DatabaseAuthPW(uri string, username string, password string) DatabaseAuth {
	return DatabaseAuth{AuthModePW, uri, username, password}
}

func DatabaseAuthX509(uri string) DatabaseAuth {
	return DatabaseAuth{AuthModeX509, uri, "", ""}
}

func (app *TasteBuddyApp) ConnectToDatabase(databaseAuth DatabaseAuth) (*TasteBuddyDatabase, error) {
	URI := databaseAuth.URI

	// create new mongo client
	app.Log("ConnectToDatabase", "Connecting to Database at "+URI+" ...")

	credential := options.Credential{}
	switch databaseAuth.DatabaseAuthMode {
	case AuthModePW:
		credential = options.Credential{
			Username:      databaseAuth.Username,
			Password:      databaseAuth.Password,
			AuthMechanism: "SCRAM-SHA-1",
		}
	case AuthModeX509:
		credential = options.Credential{
			AuthMechanism: "MONGODB-X509",
		}
	}

	ctx := DefaultContext()
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(URI).SetAuth(credential))
	if err != nil {
		return nil, app.LogError("ConnectToDatabase", err)
	}

	// try to ping MongoDB to see if connection is established
	if err = client.Ping(ctx, readpref.Primary()); err != nil {
		return nil, app.LogError("ConnectToDatabase", err)
	}
	app.Log("ConnectToDatabase", "Successfully connected to MongoDB")
	return &TasteBuddyDatabase{client, app.logger, false}, nil
}

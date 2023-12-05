// Package src
/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"errors"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type Item struct {
	ID     primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Name   LocalizedString    `json:"name,omitempty" bson:"localizedName,omitempty"`
	Type   string             `json:"type,omitempty" bson:"type,omitempty"`
	ImgUrl string             `json:"imgUrl,omitempty" bson:"imgUrl,omitempty"`
}

// HandleGetItems gets called by server
// Calls getRecipesFromDB and handles the context
func (server *TasteBuddyServer) HandleGetItems(context *fiber.Ctx) error {
	items, err := server.GetItems(false)
	if err != nil {
		server.LogError("HandleGetItems", err)
		return ErrorMessage(context, "Could not get items")
	}
	return Success(context, items)
}

// GetItemsCollection gets recipes from database
func (app *TasteBuddyApp) GetItemsCollection() *TBCollection {
	return app.GetDBCollection("items")
}

var (
	cachedItems    []Item
	cachedItemsAge int64
)

// UpdateItemCache updates the item cache
func (app *TasteBuddyApp) UpdateItemCache() error {
	app.LogTrace("UpdateItemCache", "Update item cache")
	if _, err := app.GetItems(false); err != nil {
		return app.LogError("UpdateItemCache.GetItems", err)
	}
	return nil
}

// GetItems gets all items from database
func (app *TasteBuddyApp) GetItems(cached bool) ([]Item, error) {
	if cachedItems == nil || !cached || time.Now().Unix()-cachedItemsAge > 3600 {
		app.LogDatabase("GetItems", "Get all items from database")
		var itemsFromDatabase = make([]Item, 0)
		// get all items from database that are not deleted
		if err := app.GetItemsCollection().AllWithDefault(bson.M{"deleted": bson.M{"$ne": true}}, &itemsFromDatabase, []Item{}); err != nil {
			return itemsFromDatabase, app.LogError("GetItems.AllWithDefault", err)
		}
		cachedItems = itemsFromDatabase
		cachedItemsAge = time.Now().Unix()
	} else {
		app.Log("GetItems", "Get all items from cache")
	}

	if len(cachedItems) == 0 {
		cachedItems = []Item{}
		return cachedItems, app.LogError("GetItems", errors.New("no items found"))
	}

	return cachedItems, nil
}

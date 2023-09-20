// Package src
/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"strconv"
	"time"
)

type Item struct {
	ID     string          `json:"id,omitempty" bson:"_id,omitempty"`
	Name   LocalizedString `json:"name,omitempty" bson:"localizedName,omitempty"`
	Type   string          `json:"type,omitempty" bson:"type,omitempty"`
	ImgUrl string          `json:"imgUrl,omitempty" bson:"imgUrl,omitempty"`
}

// HandleGetItems gets called by server
// Calls getRecipesFromDB and handles the context
func (server *TasteBuddyServer) HandleGetItems(context *gin.Context) {
	items, err := server.GetItems(false)
	if err != nil {
		server.LogError("HandleGetItems", err)
		ServerError(context, true)
		return
	}
	Success(context, items)
}

// HandleAddItems gets called by server
// Calls AddOrUpdateItems and handles the context
func (server *TasteBuddyServer) HandleAddItems(context *gin.Context) {
	server.LogContextHandle(context, "HandleAddItems", "Add/update items")

	var items []Item
	if err := context.BindJSON(&items); err != nil {
		server.LogError("HandleAddItems.BindJSON", err)
		BadRequestError(context, "Invalid items")
		return
	}

	if _, err := server.AddOrUpdateItems(items); err != nil {
		server.LogError("HandleAddItems.AddOrUpdateItem", err)
		ServerError(context, true)
		return
	}
	Updated(context, "item")
}

// HandleDeleteItems gets called by server
// Calls DeleteItems and handles the context
func (server *TasteBuddyServer) HandleDeleteItems(context *gin.Context) {
	server.LogContextHandle(context, "HandleDeleteItems", "Delete items")

	// Bind JSON to list of recipe ids
	var itemIds []string
	if err := context.BindJSON(&itemIds); err != nil {
		server.LogError("HandleDeleteItems.BindJSON", err)
		BadRequestError(context, err.Error())
		return
	}

	// delete items
	if err := server.DeleteItems(itemIds); err != nil {
		server.LogError("HandleDeleteItems.DeleteItems", err)
		ServerError(context, true)
		return
	}

	msg := "Deleted " + strconv.Itoa(len(itemIds)) + " items"
	server.LogContextHandle(context, "HandleDeleteItems", msg)
	Success(context, msg)
}

// GetItemsCollection gets recipes from database
func (app *TasteBuddyApp) GetItemsCollection() *TBCollection {
	return app.GetDBCollection("items")
}

var (
	cachedItems    []Item
	cachedItemsAge int64
)

func (app *TasteBuddyApp) UpdateItemCache() error {
	app.LogTrace("UpdateItemCache", "Update item cache")
	if _, err := app.GetItems(false); err != nil {
		return app.LogError("UpdateItemCache", err)
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
		return cachedItems, errors.New("no items found")
	}

	return cachedItems, nil
}

// DeleteItems deletes item from database by id
func (app *TasteBuddyApp) DeleteItems(itemIds []string) error {
	ctx := DefaultContext()
	var err error

	// delete recipe by setting deleted to true
	for _, id := range itemIds {
		if _, err = app.GetItemsCollection().UpdateByID(ctx, id, bson.D{{Key: "$set", Value: bson.D{{Key: "deleted", Value: true}}}}); err != nil {
			app.Log("DeleteItems", "Delete item "+id+" from database")
			return app.LogError("DeleteItems + "+id, err)
		}
	}

	return nil
}

// AddOrUpdateItems adds or updates multiple items in the database of items
// If an item has not an id, it will be added
func (app *TasteBuddyApp) AddOrUpdateItems(items []Item) ([]Item, error) {
	app.Log("AddOrUpdateItems", "Add or update "+fmt.Sprintf("%d", len(items))+" items")
	var itemsWithIds []interface{}
	var itemsWithoutIds []interface{}

	// Only unique items
	itemsMap := make(map[string]Item)
	for _, item := range items {
		itemsMap[item.Name.GetDefault()] = item
	}
	app.LogTrace("AddOrUpdateItems", "Found "+fmt.Sprintf("%d", len(itemsMap))+" unique items")

	// Split items into items with and without ids
	for _, item := range itemsMap {
		// Check if item name is empty
		if item.Name.GetDefault() == "" {
			app.LogWarning("AddOrUpdateItems", "Item "+item.Name.GetDefault()+" has no name")
			continue
		}

		if item.ID == "" {
			itemsWithoutIds = append(itemsWithoutIds, item)
		} else {
			itemsWithIds = append(itemsWithIds, item)
		}
	}

	// Add items without ids to database
	if len(itemsWithoutIds) > 0 {
		if _, err := app.GetItemsCollection().InsertMany(DefaultContext(), itemsWithoutIds); err != nil {
			return nil, app.LogError("AddOrUpdateItems.InsertMany", err)
		}
		app.Log("AddOrUpdateItems", "Added "+strconv.Itoa(len(itemsWithoutIds))+" items without ids to database")
	}

	// Update items with ids in database
	if len(itemsWithIds) > 0 {
		for _, item := range itemsWithIds {
			if _, err := app.GetItemsCollection().UpdateOne(DefaultContext(), bson.M{"_id": item.(Item).ID}, bson.M{"$set": item}); err != nil {
				return nil, app.LogError("AddOrUpdateItems.UpdateByID", err)
			}
		}
		app.Log("AddOrUpdateItems", "Updated "+strconv.Itoa(len(itemsWithIds))+" items with ids in database")
	}

	app.Log("AddOrUpdateItems", "Finished adding or updating "+fmt.Sprintf("%d", len(itemsWithIds)+len(itemsWithoutIds))+" items")

	items, err := app.GetItems(false)
	if err != nil {
		return nil, app.LogError("AddOrUpdateItems.GetItems", err)
	}

	return items, nil
}

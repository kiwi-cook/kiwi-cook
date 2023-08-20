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
	"go.mongodb.org/mongo-driver/bson/primitive"
	"strconv"
)

type Item struct {
	ID     primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Name   LocalizedString    `json:"name,omitempty" bson:"localizedName,omitempty"`
	Type   string             `json:"type,omitempty" bson:"type,omitempty"`
	ImgUrl string             `json:"imgUrl,omitempty" bson:"imgUrl,omitempty"`
}

// HandleGetAllItems gets called by server
// Calls getRecipesFromDB and handles the context
func (server *TasteBuddyServer) HandleGetAllItems(context *gin.Context) {
	items, err := server.GetAllItems(false)
	if err != nil {
		server.LogError("HandleGetAllItems", err)
		ServerError(context, true)
		return
	}
	Success(context, items)
}

// HandleAddItem gets called by server
// Calls addItemToDB and handles the context
func (server *TasteBuddyServer) HandleAddItem(context *gin.Context) {
	server.LogContextHandle(context, "HandleAddItem", "Trying to add/update item")

	var newItem Item
	if err := context.BindJSON(&newItem); err != nil {
		server.LogError("HandleAddItem.BindJSON", err)
		BadRequestError(context, "Invalid item")
		return
	}

	var itemId primitive.ObjectID
	if _, err := server.AddOrUpdateItem(newItem); err != nil {
		server.LogError("HandleAddItem.AddOrUpdateItem", err)
		ServerError(context, true)
		return
	}
	server.LogContextHandle(context, "HandleAddItem", "Added/Updated item "+newItem.Name.GetDefault()+" ("+newItem.ID.Hex()+")")
	Success(context, "Saved item "+itemId.Hex())
}

// HandleDeleteItemById gets called by server
// Calls DeleteItemById and handles the context
func (server *TasteBuddyServer) HandleDeleteItemById(context *gin.Context) {
	id := context.Param("id")
	server.LogContextHandle(context, "HandleDeleteItemById", "Trying to delete item "+id)

	// convert id to primitive.ObjectID
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		server.LogError("HandleDeleteItemById.ObjectIDFromHex", err)
		ServerError(context, true)
		return
	}

	// delete recipe
	if _, err := server.DeleteItemById(objectID); err != nil {
		server.LogError("HandleDeleteItemById.DeleteItemById", err)
		ServerError(context, true)
		return
	}
	server.LogContextHandle(context, "HandleDeleteItemById", "Deleted item "+id)
	Success(context, "Deleted item "+id)
}

// GetItemsCollection gets recipes from database
func (app *TasteBuddyApp) GetItemsCollection() *TBCollection {
	return app.GetDBCollection("items")
}

var (
	cachedItems []Item
)

func (app *TasteBuddyApp) UpdateItemCache() error {
	app.LogTrace("UpdateItemCache", "Update item cache")
	if _, err := app.GetAllItems(false); err != nil {
		return app.LogError("UpdateItemCache", err)
	}
	return nil
}

// GetAllItems gets all items from database
func (app *TasteBuddyApp) GetAllItems(cached bool) ([]Item, error) {
	// get all items from database that are not deleted
	if cachedItems == nil || !cached {
		app.LogDatabase("GetAllItems", "Get all items from database")
		var itemsFromDatabase []Item
		if err := app.GetItemsCollection().AllWithDefault(bson.M{"deleted": bson.M{"$ne": true}}, &itemsFromDatabase, []Item{}); err != nil {
			return itemsFromDatabase, app.LogError("GetAllItems.AllWithDefault", err)
		}
		cachedItems = itemsFromDatabase
	} else {
		app.LogTrace("GetAllItems", "Get all items from cache")
	}

	if len(cachedItems) == 0 {
		cachedItems = []Item{}
		return cachedItems, errors.New("no items found")
	}

	return cachedItems, nil
}

// DeleteItemById deletes item from database by id
func (app *TasteBuddyApp) DeleteItemById(id primitive.ObjectID) (primitive.ObjectID, error) {
	ctx := DefaultContext()
	var err error

	// delete recipe by setting deleted to true
	app.LogWarning("DeleteItemById", "Delete item "+id.Hex()+" from database")
	if _, err = app.GetItemsCollection().UpdateByID(ctx, id, bson.D{{Key: "$set", Value: bson.D{{Key: "deleted", Value: true}}}}); err != nil {
		return id, app.LogError("DeleteItemById + "+id.Hex(), err)
	}

	return id, nil
}

func (app *TasteBuddyApp) AddOrUpdateItem(item Item) ([]Item, error) {
	return app.AddOrUpdateItems([]Item{item})
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

		if item.ID.IsZero() {
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

	items, err := app.GetAllItems(false)
	if err != nil {
		return nil, app.LogError("AddOrUpdateItems.GetAllItems", err)
	}

	return items, nil
}

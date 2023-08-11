// Package src
/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"errors"
	"fmt"
	"github.com/adrg/strutil"
	"github.com/adrg/strutil/metrics"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"math"
	"strconv"
)

type Item struct {
	ID     primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Name   string             `json:"name" bson:"name" binding:"required"`
	Type   string             `json:"type,omitempty" bson:"type,omitempty"`
	ImgUrl string             `json:"imgUrl,omitempty" bson:"imgUrl,omitempty"`
	I18n   map[string]string  `json:"i18n,omitempty" bson:"i18n,omitempty"`
}

type ItemResult struct {
	Item
	error   error
	success bool
}

func NewItemResult(item Item, success bool) *ItemResult {
	return &ItemResult{
		Item:    item,
		error:   nil,
		success: success,
	}
}

func NewItemErrorResult(err error) *ItemResult {
	return &ItemResult{
		error:   err,
		success: false,
	}
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
	server.LogContextHandle(context, "HandleAddItem", "Added/Updated item "+newItem.Name+" ("+newItem.ID.Hex()+")")
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

func (app *TasteBuddyApp) GetAllItemsMappedByName(cached bool) (map[string]Item, error) {
	items, err := app.GetAllItems(cached)
	if err != nil {
		return nil, app.LogError("GetAllItemsMappedByName", err)
	}
	mappedItems := make(map[string]Item)
	for _, item := range items {
		mappedItems[item.Name] = item
	}
	return mappedItems, nil
}

// GetItemById gets item from database by id
func (app *TasteBuddyApp) GetItemById(id primitive.ObjectID) (Item, error) {
	var itemFromDatabase Item
	app.LogDebug("GetItemById", "Get item "+id.Hex()+" from database")
	err := app.GetItemsCollection().FindOneWithDefault(bson.M{"_id": id}, &itemFromDatabase, Item{})
	return itemFromDatabase, app.LogError("GetItemById.FindOneWithDefault", err)
}

// GetItemByName gets item from database by name
func (app *TasteBuddyApp) GetItemByName(name string) (error, Item) {
	var item Item
	items, err := app.GetAllItems(true)
	if err != nil {
		return app.LogError("GetItemByName", err), item
	}
	for _, i := range items {
		if i.Name == name {
			return nil, i
		}
	}
	return errors.New("no item found with name " + name), item
}

// MatchOrNewItem compares which item is most similar to the given item name
// and returns the item with the highest similarity
// If no item is found, a new item is created
// If threshold is -1, the default threshold of 0.7 is used
func (app *TasteBuddyApp) MatchOrNewItem(itemName string, threshold float64) *ItemResult {
	if itemName == "" {
		return NewItemErrorResult(errors.New("item name is empty"))
	}

	// get all items
	items, err := app.GetAllItems(true)
	if err != nil {
		return NewItemErrorResult(err)
	}

	// if no items are found, return error
	if len(items) == 0 {
		return NewItemErrorResult(errors.New("no items found"))
	}

	// if threshold is -1, use default threshold
	if threshold == -1 {
		threshold = 0.7
	}

	var mostSimilarItem = Item{Name: itemName}
	var mostSimilarity float64 = 0
	for _, item := range items {
		// if item name is equal to itemName, return item
		if itemName == item.Name {
			return NewItemResult(item, true)
		}

		// calculate similarity
		if similarity := strutil.Similarity(item.Name, itemName, metrics.NewHamming()); similarity >= threshold && similarity > mostSimilarity {
			mostSimilarItem = item
			mostSimilarity = similarity
		}
	}

	var success = false
	if mostSimilarity < threshold {
		app.LogDebug("MatchOrNewItem", "No similar item found for "+itemName+" with threshold "+fmt.Sprintf("%f", threshold))
	} else {
		success = true
		app.LogDebug("MatchOrNewItem", "Found most similar item "+mostSimilarItem.Name+" to "+itemName+" with similarity "+fmt.Sprintf("%f", mostSimilarity))
	}

	return NewItemResult(mostSimilarItem, success)
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
		itemsMap[item.Name] = item
	}
	app.LogTrace("AddOrUpdateItems", "Found "+fmt.Sprintf("%d", len(itemsMap))+" unique items")

	// Split items into items with and without ids
	for _, item := range itemsMap {
		// Check if item name is empty
		if item.Name == "" {
			app.LogWarning("AddOrUpdateItems", "Item "+item.Name+" has no name")
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
			app.LogTrace("AddOrUpdateItems", "Update item "+item.(Item).Name+" in database")
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

// CalculateItemPriceForMarket calculates the price of a recipe for a market
func (app *TasteBuddyApp) CalculateItemPriceForMarket(item *Item, market Market) (float64, bool) {
	discounts, err := app.GetDiscountsByMarket(&market)
	if err != nil {
		app.LogError("CalculateRecipePrice", err)
		return 0, false
	}

	discount, successful := item.FindMatchingDiscount(discounts)
	price, err := strconv.ParseFloat(discount.Price, 32)
	if err != nil || !successful {
		price = 0
	}
	return math.Max(price, 0), successful
}

// GetItemQuality gets the quality of an item
// 0 = empty (low quality)
// 1 = ID (medium quality)
// 2 = name (medium quality)
// 3 = name + type (medium quality)
// 4 = name + type + imgUrl (high quality)
func (item *Item) GetItemQuality() int {
	var itemQuality = 0
	var conditions = [4]bool{!item.ID.IsZero(), item.ImgUrl != "", item.Name != "", item.Type != ""}
	for _, condition := range conditions {
		if condition {
			itemQuality = itemQuality + 1
		}
	}

	return itemQuality
}

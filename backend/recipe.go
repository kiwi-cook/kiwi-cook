package main

import (
	"fmt"
	"math/rand"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Recipe struct {
	ID          primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Name        string             `json:"name" bson:"name" binding:"required"`
	Author      string             `json:"author" bson:"author" binding:"required"`
	Description string             `json:"description" bson:"description" binding:"required"`
	Steps       []Step             `json:"steps" bson:"steps" binding:"required"`
	Props       struct {
		Url       string    `json:"url,omitempty" bson:"url,omitempty"`
		ImgUrl    string    `json:"imgUrl,omitempty" bson:"imgUrl,omitempty"`
		Duration  int       `json:"duration,omitempty" bson:"duration,omitempty"`
		CreatedAt time.Time `json:"createdAt,omitempty" bson:"createdAt,omitempty"`
		Tags      []string  `json:"tags,omitempty" bson:"tags,omitempty"`
		Likes     int       `json:"likes,omitempty" bson:"likes,omitempty"`
	} `json:"props,omitempty" bson:"props,omitempty"`
	Deleted bool `json:"-" bson:"deleted,omitempty"`
}

type Step struct {
	Description               string                     `json:"description" bson:"description" binding:"required"`
	Items                     []StepItem                 `json:"items" bson:"items" binding:"required"`
	ImgUrl                    string                     `json:"imgUrl,omitempty" bson:"imgUrl,omitempty"`
	Duration                  int                        `json:"duration,omitempty" bson:"duration,omitempty"`
	AdditionalStepInformation *AdditionalStepInformation `json:"additional,omitempty" bson:"additional,omitempty"`
}

type AdditionalStepInformation struct {
	Type                  string `json:"informationType,omitempty" bson:"informationType,omitempty"`
	BakingStepInformation `json:",inline,omitempty" bson:",inline,omitempty"`
}

type BakingStepInformation struct {
	Temperature int    `json:"temperature,omitempty" bson:"temperature,omitempty"`
	BakingType  string `json:"bakingType,omitempty" bson:"bakingType,omitempty"`
}

type StepItem struct {
	ItemID primitive.ObjectID `json:"-" bson:"_id,omitempty"`
	Amount int                `json:"amount" bson:"amount" binding:"required"`
	Unit   string             `json:"unit,omitempty" bson:"unit,omitempty" binding:"required"`
	Item   Item               `json:"item" bson:"-" binding:"required"`
}

type Item struct {
	ID     primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Name   string             `json:"name" bson:"name" binding:"required"`
	Type   string             `json:"type,omitempty" bson:"type,omitempty"`
	ImgUrl string             `json:"imgUrl,omitempty" bson:"imgUrl,omitempty"`
}

// HandleGetAllRecipes gets called by router
// Calls getRecipesFromDB and handles the context
func (app *TasteBuddyApp) HandleGetAllRecipes(context *gin.Context) {
	recipes, err := app.client.GetAllRecipes()
	if err != nil {
		LogError("HandleGetAllRecipes", err)
		ServerError(context, true)
		return
	}
	SuccessJSON(context, recipes)
}

func (app *TasteBuddyApp) HandleGetRecipeById(context *gin.Context) {
	id := context.Param("id")

	// convert id to primitive.ObjectID
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		LogError("HandleGetRecipeById", err)
		ServerError(context, true)
		return
	}

	recipe, err := app.client.GetRecipeById(objectID)
	if err != nil {
		LogError("HandleGetRecipeById", err)
		ServerError(context, true)
		return
	}
	SuccessJSON(context, recipe)
}

// HandleGetRandomRecipe gets called by router
// Calls getRecipesFromDB and selects a random recipe
func (app *TasteBuddyApp) HandleGetRandomRecipe(context *gin.Context) {
	recipes, err := app.client.GetAllRecipes()
	if err != nil {
		LogError("HandleGetRandomRecipe", err)
		ServerError(context, true)
		return
	}

	// check if there are recipes
	if len(recipes) == 0 {
		NotFoundError(context, "Recipes")
		return
	}

	// get random recipe
	randomIndex := rand.Intn(len(recipes))
	SuccessJSON(context, recipes[randomIndex])
}

// HandleAddRecipe gets called by router
// Calls addRecipeToDB and handles the context
func (app *TasteBuddyApp) HandleAddRecipe(context *gin.Context) {
	LogContextHandle(context, "HandleAddRecipe", "Trying to add/update recipe")

	// try to bind json to recipe
	var newRecipe Recipe
	if err := context.BindJSON(&newRecipe); err != nil {
		LogError("HandleAddRecipe", err)
		BadRequestError(context, "Invalid Recipe")
		return
	}

	var recipeId primitive.ObjectID
	var err error
	if recipeId, err = app.client.AddOrUpdateRecipe(newRecipe); err != nil {
		LogError("HandleAddRecipe", err)
		ServerError(context, true)
		return
	}
	LogContextHandle(context, "HandleAddRecipe", "Added/Updated recipe "+newRecipe.Name+" ("+newRecipe.ID.Hex()+")")
	Success(context, "Saved recipe "+recipeId.Hex())
}

// HandleDeleteRecipeById gets called by router
// Calls DeleteRecipeById and handles the context
func (app *TasteBuddyApp) HandleDeleteRecipeById(context *gin.Context) {
	id := context.Param("id")
	LogContextHandle(context, "HandleDeleteRecipeById", "Trying to delete recipe "+id)

	// convert id to primitive.ObjectID
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		LogError("HandleDeleteRecipeById", err)
		ServerError(context, true)
		return
	}

	// delete recipe
	if _, err := app.client.DeleteRecipeById(objectID); err != nil {
		LogError("HandleDeleteRecipeById", err)
		ServerError(context, true)
		return
	}
	LogContextHandle(context, "HandleDeleteRecipeById", "Deleted recipe "+id)
	Success(context, "Deleted recipe "+id)
}

// HandleFindRecipesByItemNames gets called by router
// Calls GetRecipesByItemNames and handles the context
func (app *TasteBuddyApp) HandleFindRecipesByItemNames(context *gin.Context) {
	itemIds := context.Param("itemIds")

	// split itemIds string into array
	splitItemIds := strings.Split(itemIds, ",")

	recipes, err := app.client.GetRecipesByItemNames(splitItemIds)
	if err != nil {
		LogError("HandleFindRecipesByItemNames", err)
		ServerError(context, true)
		return
	}
	SuccessJSON(context, recipes)
}

// HandleGetAllItems gets called by router
// Calls getRecipesFromDB and handles the context
func (app *TasteBuddyApp) HandleGetAllItems(context *gin.Context) {
	items, err := app.client.GetAllItems()
	if err != nil {
		LogError("HandleGetAllItems", err)
		ServerError(context, true)
		return
	}
	SuccessJSON(context, items)
}

// HandleGetItemById gets called by router
// Calls getItemByIdFromDB and handles the context
func (app *TasteBuddyApp) HandleGetItemById(context *gin.Context) {
	id := context.Param("id")

	// convert id to primitive.ObjectID
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		LogError("HandleGetItemById", err)
		ServerError(context, true)
		return
	}

	item, err := app.client.GetItemById(objectID)
	if err != nil {
		LogError("HandleGetItemById", err)
		ServerError(context, true)
		return
	}

	SuccessJSON(context, item)
}

// HandleAddItem gets called by router
// Calls addItemToDB and handles the context
func (app *TasteBuddyApp) HandleAddItem(context *gin.Context) {
	LogContextHandle(context, "HandleAddItem", "Trying to add/update item")

	var newItem Item
	if err := context.BindJSON(&newItem); err != nil {
		LogError("HandleAddItem", err)
		BadRequestError(context, "Invalid item")
		return
	}

	var itemId primitive.ObjectID
	var err error
	if itemId, err = app.client.AddOrUpdateItem(newItem); err != nil {
		LogError("HandleAddItem", err)
		ServerError(context, true)
		return
	}
	LogContextHandle(context, "HandleAddItem", "Added/Updated item "+newItem.Name+" ("+newItem.ID.Hex()+")")
	Success(context, "Saved item "+itemId.Hex())
}

// HandleDeleteItemById gets called by router
// Calls DeleteItemById and handles the context
func (app *TasteBuddyApp) HandleDeleteItemById(context *gin.Context) {
	id := context.Param("id")
	LogContextHandle(context, "HandleDeleteItemById", "Trying to delete item "+id)

	// convert id to primitive.ObjectID
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		LogError("HandleDeleteItemById", err)
		ServerError(context, true)
		return
	}

	// delete recipe
	if _, err := app.client.DeleteItemById(objectID); err != nil {
		LogError("HandleDeleteItemById", err)
		ServerError(context, true)
		return
	}
	LogContextHandle(context, "HandleDeleteItemById", "Deleted item "+id)
	Success(context, "Deleted item "+id)
}

// GetRecipesCollection gets recipes collection from database
func (client *TasteBuddyDatabase) GetRecipesCollection() *mongo.Collection {
	return client.Database("tastebuddy").Collection("recipes")
}

// GetAllRecipes gets all recipes from database
func (client *TasteBuddyDatabase) GetAllRecipes() ([]Recipe, error) {
	ctx := DefaultContext()

	// get all recipes from database that are not deleted
	cursor, err := client.GetRecipesCollection().Find(ctx, bson.M{"deleted": bson.M{"$ne": true}})
	if err != nil {
		LogError("GetAllRecipes", err)
		return []Recipe{}, err
	}

	// try to get all recipes from database and bind them to recipesFromDatabase
	var recipesFromDatabase []Recipe
	if err = cursor.All(ctx, &recipesFromDatabase); err != nil {
		LogError("GetAllRecipes", err)
		return []Recipe{}, err
	}

	if recipesFromDatabase == nil {
		// replace nil with empty array
		recipesFromDatabase = []Recipe{}
	}

	// get all items from database
	items, err := client.GetAllItems()
	if err != nil {
		LogError("GetAllRecipes", err)
		return []Recipe{}, err
	}

	// prepare items for each recipe
	for i := range recipesFromDatabase {
		MapItemIdsToItem(&recipesFromDatabase[i], items)
	}

	return recipesFromDatabase, nil
}

func MapItemIdsToItem(recipe *Recipe, items []Item) {

	// create map of items
	itemsMap := make(map[primitive.ObjectID]Item)
	for i := range items {
		itemsMap[items[i].ID] = items[i]
	}

	// replace item ids with items
	for i := range recipe.Steps {
		for j := range recipe.Steps[i].Items {
			recipe.Steps[i].Items[j].Item = itemsMap[recipe.Steps[i].Items[j].ItemID]
		}
	}
}

func (client *TasteBuddyDatabase) GetRecipeById(id primitive.ObjectID) (Recipe, error) {
	ctx := DefaultContext()
	// try to get collection of recipes
	recipe := client.GetRecipesCollection().FindOne(ctx, bson.M{"_id": id})

	if recipe.Err() != nil {
		LogError("GetRecipeById", recipe.Err())
		return Recipe{}, recipe.Err()
	}

	var recipeFromDatabase Recipe
	if err := recipe.Decode(&recipeFromDatabase); err != nil {
		LogError("GetRecipeById", err)
		return Recipe{}, err
	}

	return recipeFromDatabase, nil
}

// AddOrUpdateRecipe adds a new recipe to the database of recipes
// and returns all recipes from the database
func (client *TasteBuddyDatabase) AddOrUpdateRecipe(newRecipe Recipe) (primitive.ObjectID, error) {
	ctx := DefaultContext()
	var err error
	var objectId primitive.ObjectID

	// get the items from the recipe and add them to the database
	err = newRecipe.PrepareForDB(client)
	if err != nil {
		LogError("AddOrUpdateRecipe + recipe "+newRecipe.Name, err)
		return objectId, err
	}

	if newRecipe.ID.IsZero() {
		// add new recipe
		// set createdAt to current time
		LogWarning("AddOrUpdateRecipe + recipe "+newRecipe.Name, "Add new recipe to database")
		var result *mongo.InsertOneResult
		newRecipe.Props.CreatedAt = time.Now()
		result, err = client.GetRecipesCollection().InsertOne(ctx, newRecipe)
		objectId = result.InsertedID.(primitive.ObjectID)
	} else {
		// update recipe
		LogWarning("AddOrUpdateRecipe + recipe "+newRecipe.Name+"("+newRecipe.ID.Hex()+")", "Update existing recipe in database")
		_, err = client.GetRecipesCollection().UpdateOne(ctx,
			bson.D{{Key: "_id", Value: newRecipe.ID}},
			bson.D{{Key: "$set", Value: newRecipe}})
		objectId = newRecipe.ID
	}
	if err != nil {
		LogError("AddOrUpdateRecipe + recipe "+newRecipe.Name+"("+objectId.Hex()+")", err)
		return objectId, err
	}

	LogWarning("AddOrUpdateRecipe + recipe "+newRecipe.Name+"("+objectId.Hex()+")", "Successful operation")
	return objectId, nil
}

func (client *TasteBuddyDatabase) DeleteRecipeById(id primitive.ObjectID) (primitive.ObjectID, error) {
	ctx := DefaultContext()
	var err error

	// delete recipe by setting deleted to true
	LogWarning("DeleteRecipeById", "Delete recipe "+id.Hex()+" from database")
	_, err = client.GetRecipesCollection().UpdateByID(ctx, id, bson.D{{Key: "$set", Value: bson.D{{Key: "deleted", Value: true}}}})
	if err != nil {
		LogError("DeleteRecipeById", err)
		return id, err
	}

	return id, nil
}

func (recipe *Recipe) PrepareForDB(client *TasteBuddyDatabase) error {
	// normalize all items in recipe
	for stepIndex, step := range recipe.Steps {
		for itemIndex, stepItem := range step.Items {
			var err error

			// if item in stepItem has an id, it is already in the database
			itemId, err := client.AddOrUpdateItem(stepItem.Item)
			if err != nil {
				LogError("PrepareForDB + "+recipe.Name+" + "+stepItem.Item.Name, err)
				return err
			}
			Log("PrepareForDB + recipe "+recipe.Name+"("+recipe.ID.Hex()+")", "Map "+stepItem.Item.Name+" to "+itemId.Hex())
			stepItem.ItemID = itemId
			stepItem.Item = Item{}
			recipe.Steps[stepIndex].Items[itemIndex] = stepItem
		}
	}
	return nil
}

// GetItemsCollection gets recipes from database
func (client *TasteBuddyDatabase) GetItemsCollection() *mongo.Collection {
	return client.Database("tastebuddy").Collection("items")
}

// GetAllItems gets all items from database
func (client *TasteBuddyDatabase) GetAllItems() ([]Item, error) {
	ctx := DefaultContext()

	// get all items from database that are not deleted
	cursor, err := client.GetItemsCollection().Find(ctx, bson.M{"deleted": bson.M{"$ne": true}})
	if err != nil {
		LogError("GetAllItems", err)
		return []Item{}, err
	}
	var itemsFromDatabase []Item
	if err = cursor.All(ctx, &itemsFromDatabase); err != nil {
		LogError("GetAllItems", err)
		return []Item{}, err
	}

	if itemsFromDatabase == nil {
		// return void array if nil
		itemsFromDatabase = []Item{}
	}
	return itemsFromDatabase, nil
}

// GetItemById gets item from database by id
func (client *TasteBuddyDatabase) GetItemById(id primitive.ObjectID) (Item, error) {
	ctx := DefaultContext()

	items := client.GetItemsCollection().FindOne(ctx, bson.M{"_id": id})

	if items.Err() != nil {
		LogError("GetItemById", items.Err())
		return Item{}, items.Err()
	}

	var itemFromDatabase Item
	if err := items.Decode(&itemFromDatabase); err != nil {
		LogError("GetAllItems", err)
		return Item{}, err
	}

	return itemFromDatabase, nil
}

func (client *TasteBuddyDatabase) DeleteItemById(id primitive.ObjectID) (primitive.ObjectID, error) {
	ctx := DefaultContext()
	var err error

	// delete recipe by setting deleted to true
	LogWarning("DeleteItemById", "Delete item "+id.Hex()+" from database")
	_, err = client.GetItemsCollection().UpdateByID(ctx, id, bson.D{{Key: "$set", Value: bson.D{{Key: "deleted", Value: true}}}})
	if err != nil {
		LogError("DeleteItemById + "+id.Hex(), err)
		return id, err
	}

	return id, nil
}

// AddOrUpdateItems adds or updates multiple items in the database of items
func (client *TasteBuddyDatabase) AddOrUpdateItems(newItems []Item) error {
	for _, item := range newItems {
		if _, err := client.AddOrUpdateItem(item); err != nil {
			return err
		}
	}
	return nil
}

// AddOrUpdateItem adds or updates an item in the database of items
func (client *TasteBuddyDatabase) AddOrUpdateItem(newItem Item) (primitive.ObjectID, error) {
	ctx := DefaultContext()
	var err error
	var objectId primitive.ObjectID

	if newItem.ID.IsZero() {
		// add item
		var result *mongo.InsertOneResult
		LogWarning("AddOrUpdateItem + "+newItem.Name, "Add new item to database")
		result, err = client.GetItemsCollection().InsertOne(ctx, newItem)
		objectId = result.InsertedID.(primitive.ObjectID)
	} else {
		// update item
		LogWarning("AddOrUpdateItem + "+newItem.Name+"("+newItem.ID.Hex()+")", "Update existing item in database")
		_, err = client.GetItemsCollection().UpdateOne(ctx,
			bson.D{{Key: "_id", Value: newItem.ID}},
			bson.D{{Key: "$set", Value: newItem}})
		objectId = newItem.ID
	}
	if err != nil {
		LogError("AddOrUpdateItem + "+newItem.Name, err)
		return objectId, err
	}
	LogWarning("AddOrUpdateItem + "+newItem.Name+"("+objectId.Hex()+")", "Successful operation")
	return objectId, nil
}

// ExtractItems gets all items used in a recipe
func (recipe *Recipe) ExtractItems() []Item {
	var items []Item

	for _, step := range recipe.Steps {
		for _, stepItem := range step.Items {
			items = append(items, stepItem.Item)
		}
	}
	return items
}

// GetRecipesByItemNames gets the recipes in which the given items are used
func (client *TasteBuddyDatabase) GetRecipesByItemNames(splitItemIds []string) ([]Recipe, error) {
	// use map since its easier to avoid duplicates
	var recipesMap = make(map[string]Recipe)

	// get all recipes from database
	recipes, err := client.GetAllRecipes()
	if err != nil {
		LogError("GetRecipesByItemNames", err)
		return []Recipe{}, err
	}

	for _, itemID := range splitItemIds {
		for _, recipe := range recipes {
			// iterate through each item used in recipe
			var itemsByRecipe = recipe.ExtractItems()
			for _, recipeItemID := range itemsByRecipe {
				// add recipe to map if not already added and if itemID corresponds to recipeItemID
				if _, ok := recipesMap[recipe.ID.Hex()]; !ok && itemID == recipeItemID.ID.Hex() {
					recipesMap[recipe.ID.Hex()] = recipe
				}
			}
		}
	}

	// convert map to array
	var filteredRecipes []Recipe
	for _, recipe := range recipesMap {
		filteredRecipes = append(filteredRecipes, recipe)
	}

	return filteredRecipes, nil
}

// CleanUpItemsInRecipes removes all items from recipes that are not in the database
// and replaces them with the best item from the database
func (client *TasteBuddyDatabase) CleanUpItemsInRecipes() error {
	var err error

	var items []Item
	var recipes []Recipe

	// get items
	items, err = client.GetAllItems()
	if err != nil {
		LogError("CleanUpItemsInRecipes", err)
		return err
	}

	// create map of the "best" item for each name
	var itemMap = make(map[string]Item)
	for _, item := range items {
		// check if map already contains item
		if itemFromMap, ok := itemMap[item.Name]; ok {
			// check if item is better than item in map
			if GetItemQuality(item) > GetItemQuality(itemFromMap) {
				// replace item in map
				itemMap[item.Name] = item
				Log("CleanUpItemsInRecipes", fmt.Sprintf("replace %s with %s", itemFromMap.ID.Hex(), item.ID.Hex()))
			}
		} else {
			// add item to map
			itemMap[item.Name] = item
		}
	}

	// get recipes
	recipes, err = client.GetAllRecipes()
	if err != nil {
		LogError("CleanUpItemsInRecipes", err)
		return err
	}

	// go through all recipes
	var amountCleanedUp = 0
	for _, recipe := range recipes {
		for stepIndex, step := range recipe.Steps {
			for itemIndex, stepItem := range step.Items {
				// check if item is in map
				if item, ok := itemMap[stepItem.Item.Name]; ok {
					// replace item
					stepItem.Item = item
					stepItem.ItemID = item.ID
					recipe.Steps[stepIndex].Items[itemIndex] = stepItem
					amountCleanedUp++
				}
			}
		}
	}

	// update recipes
	for _, recipe := range recipes {
		_, err = client.AddOrUpdateRecipe(recipe)
		if err != nil {
			LogError("CleanUpItemsInRecipes", err)
			return err
		}
	}

	Log("CleanUpItemsInRecipes", fmt.Sprintf("Clean up %d recipes...", amountCleanedUp))

	return nil
}

// GetItemQuality gets the quality of an item
// 0 = empty (low quality)
// 1 = ID (medium quality)
// 2 = name (medium quality)
// 3 = name + type (medium quality)
// 4 = name + type + imgurl (high quality)
func GetItemQuality(item Item) int {
	var itemQuality = 0

	if !item.ID.IsZero() {
		itemQuality = itemQuality + 1
	}

	// check if url is not empty
	if item.ImgUrl != "" {
		itemQuality = itemQuality + 1
	}

	// check if url is not empty
	if item.Name != "" {
		itemQuality = itemQuality + 1
	}

	// check if url is not empty
	if item.Type != "" {
		itemQuality = itemQuality + 1
	}

	return itemQuality
}

// CleanUpUnusedAttributesInRecipes marshals and unmarshals all recipes and
// tries to remove all unused attributes
func (client *TasteBuddyDatabase) CleanUpUnusedAttributesInRecipes() error {
	recipes, err := client.GetAllRecipes()
	if err != nil {
		LogError("CleanUpUnusedAttributesInRecipes", err)
		return err
	}

	for _, recipe := range recipes {
		if _, err := client.AddOrUpdateRecipe(recipe); err != nil {
			return err
		}
	}

	return nil
}

// GoRoutineCleanUpRecipes contains goroutines that are called every 6 hours
// to clean up parts of the recipes
func GoRoutineCleanUpRecipes(client *TasteBuddyDatabase) {
	for {
		client.CleanUpItemsInRecipes()
		client.CleanUpUnusedAttributesInRecipes()
		// clean up recipes every 6 hours
		time.Sleep(6 * time.Hour)
	}
}

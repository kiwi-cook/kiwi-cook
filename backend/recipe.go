package main

import (
	"log"
	"math/rand"
	"net/http"
	"strings"

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
	ImgUrl      string             `json:"imgUrl,omitempty" bson:"imgUrl,omitempty"`
	Tags        []string           `json:"tags,omitempty" bson:"tags,omitempty"`
	CookingTime int                `json:"cookingTime" bson:"cookingTime" binding:"required"`
	Steps       []Step             `json:"steps" bson:"steps" binding:"required"`
}

type Step struct {
	Items       []StepItem `json:"items" bson:"items" binding:"required"`
	Description string     `json:"description" bson:"description" binding:"required"`
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
		log.Print(err)
		ServerError(context, true)
		return
	}
	context.JSON(http.StatusOK, recipes)
}

func (app *TasteBuddyApp) HandleGetRecipeById(context *gin.Context) {
	id := context.Param("id")

	// convert id to primitive.ObjectID
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		log.Print(err)
		ServerError(context, true)
		return
	}

	recipe, err := app.client.GetRecipeById(objectID)
	if err != nil {
		log.Print(err)
		ServerError(context, true)
		return
	}

	context.JSON(http.StatusOK, recipe)
}

// HandleGetRandomRecipe gets called by router
// Calls getRecipesFromDB and selects a random recipe
func (app *TasteBuddyApp) HandleGetRandomRecipe(context *gin.Context) {
	recipes, err := app.client.GetAllRecipes()
	if err != nil {
		log.Print(err)
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
	// try to bind json to recipe
	var newRecipe Recipe
	if err := context.BindJSON(&newRecipe); err != nil {
		log.Print(err)
		BadRequestError(context, "Invalid Recipe")
		return
	}

	if err := app.client.AddOrUpdateRecipe(newRecipe); err != nil {
		log.Print(err)
		ServerError(context, true)
		return
	}
	Success(context, "Added recipe")
}

// HandleFindRecipesByItemNames gets called by router
// Calls GetRecipesByItemNames and handles the context
func (app *TasteBuddyApp) HandleFindRecipesByItemNames(context *gin.Context) {
	itemIds := context.Param("itemIds")

	// split itemIds string into array
	splitItemIds := strings.Split(itemIds, ",")

	recipes, err := app.client.GetRecipesByItemNames(splitItemIds)
	if err != nil {
		log.Print(err)
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
		log.Print(err)
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
		log.Print(err)
		ServerError(context, true)
		return
	}

	item, err := app.client.GetItemById(objectID)
	if err != nil {
		log.Print(err)
		ServerError(context, true)
		return
	}

	SuccessJSON(context, item)
}

// HandleAddItem gets called by router
// Calls addItemToDB and handles the context
func (app *TasteBuddyApp) HandleAddItem(context *gin.Context) {
	var newItem Item
	if err := context.BindJSON(&newItem); err != nil {
		log.Print(err)
		BadRequestError(context, "Invalid item")
		return
	}

	if _, err := app.client.AddOrUpdateItem(newItem); err != nil {
		log.Print(err)
		ServerError(context, true)
		return
	}
	Success(context, "Added item")
}

// getRecipesCollection gets recipes collection from database
func (client *TasteBuddyDatabase) GetRecipesCollection() *mongo.Collection {
	return client.Database("tastebuddy").Collection("recipes")
}

// GetAllRecipes gets all recipes from database
func (client *TasteBuddyDatabase) GetAllRecipes() ([]Recipe, error) {
	ctx := DefaultContext()
	// try to get collection of recipes
	cursor, err := client.GetRecipesCollection().Find(ctx, bson.M{})
	if err != nil {
		log.Print(err)
		return []Recipe{}, err
	}

	// try to get all recipes from database and bind them to recipesFromDatabase
	var recipesFromDatabase []Recipe
	if err = cursor.All(ctx, &recipesFromDatabase); err != nil {
		log.Print(err)
		return []Recipe{}, err
	}

	if recipesFromDatabase == nil {
		// replace nil with empty array
		recipesFromDatabase = []Recipe{}
	}

	// get all items from database
	items, err := client.GetAllItems()
	if err != nil {
		log.Print(err)
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
		log.Print(recipe.Err())
		return Recipe{}, recipe.Err()
	}

	var recipeFromDatabase Recipe
	if err := recipe.Decode(&recipeFromDatabase); err != nil {
		log.Print(err)
		return Recipe{}, err
	}

	return recipeFromDatabase, nil
}

// addRecipeToDB adds a new recipe to the database of recipes
// and returns all recipes from the database
func (client *TasteBuddyDatabase) AddOrUpdateRecipe(newRecipe Recipe) error {
	ctx := DefaultContext()
	var err error

	// get the items from the recipe and add them to the database
	err = newRecipe.PrepareForDB(client)
	if err != nil {
		log.Print(err)
		return err
	}

	if newRecipe.ID.IsZero() {
		// add new recipe
		_, err = client.GetRecipesCollection().InsertOne(ctx, newRecipe)
	} else {
		// update recipe
		_, err = client.GetRecipesCollection().UpdateOne(ctx,
			bson.D{{Key: "_id", Value: newRecipe.ID}},
			bson.D{{Key: "$set", Value: newRecipe}})
	}
	if err != nil {
		log.Print(err)
		return err
	}

	return nil
}

func (recipe *Recipe) PrepareForDB(client *TasteBuddyDatabase) error {
	// normalize all items in recipe
	for stepIndex, step := range recipe.Steps {
		for itemIndex, stepItem := range step.Items {
			var err error

			// if item in stepItem has an id, it is already in the database
			itemId, err := client.AddOrUpdateItem(stepItem.Item)
			if err != nil {
				log.Print(err)
				return err
			}
			stepItem.ItemID = itemId
			stepItem.Item = Item{}
			log.Print("[PrepareForDB] map stepItem: " + stepItem.Item.Name + " to " + stepItem.ItemID.String())
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
	cursor, err := client.GetItemsCollection().Find(ctx, bson.M{})
	if err != nil {
		log.Print(err)
		return []Item{}, err
	}
	var itemsFromDatabase []Item
	if err = cursor.All(ctx, &itemsFromDatabase); err != nil {
		log.Print(err)
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
		log.Print(items.Err())
		return Item{}, items.Err()
	}

	var itemFromDatabase Item
	if err := items.Decode(&itemFromDatabase); err != nil {
		log.Print(err)
		return Item{}, err
	}

	return itemFromDatabase, nil
}

// addOrUpdateItemToDB adds or updates multiple items in the database of items
func (client *TasteBuddyDatabase) AddOrUpdateItems(newItems []Item) error {
	for _, item := range newItems {
		if _, err := client.AddOrUpdateItem(item); err != nil {
			return err
		}
	}
	return nil
}

// AddOrUpdate adds or updates an item in the database of items
func (client *TasteBuddyDatabase) AddOrUpdateItem(newItem Item) (primitive.ObjectID, error) {
	ctx := DefaultContext()
	var err error
	var objectId primitive.ObjectID
	if newItem.ID.IsZero() {
		// add item
		var result *mongo.InsertOneResult
		result, err = client.GetItemsCollection().InsertOne(ctx, newItem)
		objectId = result.InsertedID.(primitive.ObjectID)
	} else {
		// update item
		_, err = client.GetItemsCollection().UpdateOne(ctx,
			bson.D{{Key: "_id", Value: newItem.ID}},
			bson.D{{Key: "$set", Value: newItem}})
		objectId = newItem.ID
	}
	if err != nil {
		log.Print(err)
		return objectId, err
	}
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
		log.Print(err)
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

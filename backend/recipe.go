package main

import (
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Recipe struct {
	ID          primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Name        string             `json:"name" bson:"name" binding:"required"`
	Author      string             `json:"author" bson:"author" binding:"required"`
	Description string             `json:"description" bson:"description" binding:"required"`
	ImgUrl      string             `json:"imgUrl,omitempty" bson:"imgUrl,omitempty"`
	Tags        []string           `json:"tags" bson:"tags" binding:"required"`
	CookingTime int                `json:"cookingTime" bson:"cookingTime" binding:"required"`
	Steps       []Step             `json:"steps" bson:"steps" binding:"required"`
}

type Step struct {
	Items       []StepItem `json:"items" bson:"items"`
	Description string     `json:"description" bson:"description"`
}

type StepItem struct {
	Amount int    `json:"amount" bson:"amount"`
	Unit   string `json:"unit,omitempty" bson:"unit,omitempty"`
	ItemID string `json:"itemID" bson:"itemID"`
}

type Item struct {
	ID     string `json:"_id,omitempty" bson:"_id,omitempty"`
	Name   string `json:"name" bson:"name" binding:"required"`
	Type   string `json:"type" bson:"type" binding:"required"`
	ImgUrl string `json:"imgUrl,omitempty" bson:"imgUrl,omitempty"`
}

// HandleGetRecipesFromDB gets called by router
// Calls getRecipesFromDB and handles the context
func HandleGetRecipesFromDB(context *gin.Context, client *mongo.Client) {
	recipes, err := getRecipesFromDB(client)
	if err != nil {
		log.Print(err)
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}
	context.JSON(http.StatusOK, recipes)
}

// HandleAddRecipeToDB gets called by router
// Calls addRecipeToDB and handles the context
func HandleAddRecipeToDB(context *gin.Context, client *mongo.Client) {
	// try to bind json to recipe
	var newRecipe Recipe
	if err := context.BindJSON(&newRecipe); err != nil {
		log.Print(err)
		context.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
		return
	}

	recipes, err := addRecipeToDB(client, newRecipe)
	if err != nil {
		log.Print(err)
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}
	context.JSON(http.StatusOK, recipes)
}

// HandleFindRecipesByItemNames gets called by router
// Calls findRecipesByItemNames and handles the context
func HandleFindRecipesByItemNames(context *gin.Context, client *mongo.Client) {
	itemIds := context.Param("itemIds")

	// split itemIds string into array
	splitItemIds := strings.Split(itemIds, ",")

	recipes, err := findRecipesByItemNames(client, splitItemIds)
	if err != nil {
		log.Print(err)
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}
	context.JSON(http.StatusOK, recipes)
}

// HandleGetRecipesFromDB gets called by router
// Calls getRecipesFromDB and handles the context
func HandleGetItemsFromDB(context *gin.Context, client *mongo.Client) {
	items, err := getItemsFromDB(client)
	if err != nil {
		log.Print(err)
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}
	context.JSON(http.StatusOK, items)
}

// HandleAddItemToDB gets called by router
// Calls addItemToDB and handles the context
func HandleAddItemToDB(context *gin.Context, client *mongo.Client) {
	var newItem Item
	err := context.BindJSON(&newItem)
	if err != nil {
		log.Print(err)
	}

	items, err := addItemToDB(client, newItem)
	if err != nil {
		log.Print(err)
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}
	context.JSON(http.StatusOK, items)
}

// Get recipes from database
func getRecipesCollection(client *mongo.Client) *mongo.Collection {
	return client.Database("tastebuddy").Collection("recipes")
}

// Get all recipes from database
func getRecipesFromDB(client *mongo.Client) ([]Recipe, error) {
	ctx := DefaultContext()
	// try to get collection of recipes
	cursor, err := getRecipesCollection(client).Find(ctx, bson.M{})
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

	return recipesFromDatabase, nil
}

// Adds a new recipe to the database of recipes
// and returns all recipes
func addRecipeToDB(client *mongo.Client, newRecipe Recipe) ([]Recipe, error) {
	ctx := DefaultContext()
	opts := options.Update().SetUpsert(true)
	if _, err := getRecipesCollection(client).UpdateOne(ctx,
		bson.D{{Key: "_id", Value: newRecipe.ID}},
		bson.D{{Key: "$set", Value: newRecipe}}, opts); err != nil {
		log.Print(err)
		return []Recipe{}, err
	}

	return getRecipesFromDB(client)
}

// Get recipes from database
func getItemsCollection(client *mongo.Client) *mongo.Collection {
	return client.Database("tastebuddy").Collection("items")
}

// Get all items from database
func getItemsFromDB(client *mongo.Client) ([]Item, error) {
	ctx := DefaultContext()
	cursor, err := getItemsCollection(client).Find(ctx, bson.M{})
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

// AddItemToDB adds a new recipe to the database of recipes
// and returns the list of recipes
func addItemToDB(client *mongo.Client, newItem Item) ([]Item, error) {
	ctx := DefaultContext()
	_, err := getItemsCollection(client).InsertOne(ctx, newItem)
	if err != nil {
		log.Print(err)
		return []Item{}, err
	}
	return getItemsFromDB(client)
}

// Get all items used in a recipe
func getItemsByRecipe(recipe Recipe) []string {
	var items = []string{}

	for _, step := range recipe.Steps {
		for _, stepItem := range step.Items {
			items = append(items, stepItem.ItemID)
		}
	}
	return items
}

// Get recipe with the given id
func findRecipeById(client *mongo.Client, recipeId string) (Recipe, error) {
	ctx := DefaultContext()
	cursor, err := getRecipesCollection(client).Find(ctx, bson.M{"_id": recipeId})
	if err != nil {
		log.Print(err)
		return Recipe{}, err
	}

	var recipe Recipe
	if err := cursor.Decode(&recipe); err != nil {
		log.Print(err)
		return Recipe{}, err
	}
	return recipe, nil
}

// FindRecipesByItems returns the recipes in which the
// given items are used
func findRecipesByItemNames(client *mongo.Client, splitItemIds []string) ([]Recipe, error) {
	// use map since its easier to avoid duplicates
	var recipesMap = make(map[string]Recipe)

	// get all recipes from database
	recipes, err := getRecipesFromDB(client)
	if err != nil {
		log.Print(err)
		return []Recipe{}, err
	}

	for _, itemID := range splitItemIds {
		for _, recipe := range recipes {
			// iterate through each item used in recipe
			var itemsByRecipe = getItemsByRecipe(recipe)
			for _, recipeItemID := range itemsByRecipe {
				// add recipe to map if not already added and if itemID corresponds to recipeItemID
				if _, ok := recipesMap[recipe.ID.Hex()]; !ok && itemID == recipeItemID {
					recipesMap[recipe.ID.Hex()] = recipe
				}
			}
		}
	}

	// convert map to array
	var filteredRecipes = []Recipe{}
	for _, recipe := range recipesMap {
		filteredRecipes = append(filteredRecipes, recipe)
	}

	return filteredRecipes, nil
}

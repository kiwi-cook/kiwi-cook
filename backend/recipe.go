package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Recipe struct {
	ID          string   `json:"_id,omitempty" bson:"_id,omitempty"`
	Name        string   `json:"name" bson:"name" binding:"required"`
	Author      string   `json:"author" bson:"author" binding:"required"`
	Description string   `json:"description" bson:"description" binding:"required"`
	ImgUrl      string   `json:"imgUrl,omitempty" bson:"imgUrl,omitempty"`
	Tags        []string `json:"tags" bson:"tags" binding:"required"`
	CookingTime int      `json:"cookingTime" bson:"cookingTime" binding:"required"`
	Steps       []Step   `json:"steps" bson:"steps" binding:"required"`
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
	Name   string `json:"name" bson:"name"`
	Type   string `json:"type" bson:"type"`
	ImgUrl string `json:"imgUrl,omitempty" bson:"imgUrl,omitempty"`
}

// Get recipes from database
func GetRecipesCollection(client *mongo.Client) *mongo.Collection {
	return client.Database("tastebuddy").Collection("recipes")
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

// Gets all recipes from database
func getRecipesFromDB(client *mongo.Client) ([]Recipe, error) {
	ctx := DefaultContext()
	// try to get collection of recipes
	cursor, err := GetRecipesCollection(client).Find(ctx, bson.M{})
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

// Adds a new recipe to the database of recipes
// and returns all recipes
func addRecipeToDB(client *mongo.Client, newRecipe Recipe) ([]Recipe, error) {
	ctx := DefaultContext()
	if _, err := GetRecipesCollection(client).InsertOne(ctx, newRecipe); err != nil {
		log.Print(err)
		return []Recipe{}, err
	}

	return getRecipesFromDB(client)
}

// Get recipes from database
func GetItemsCollection(client *mongo.Client) *mongo.Collection {
	return client.Database("tastebuddy").Collection("items")
}

// Gets all items from database
func GetItemsFromDB(client *mongo.Client) []Item {
	ctx := DefaultContext()
	cursor, err := GetItemsCollection(client).Find(ctx, bson.M{})
	if err != nil {
		log.Fatal(err)
	}
	var itemsFromDatabase []Item
	if err = cursor.All(ctx, &itemsFromDatabase); err != nil {
		log.Fatal(err)
	}

	if itemsFromDatabase == nil {
		// return void array if nil
		return []Item{}
	}
	return itemsFromDatabase
}

// AddItemToDB adds a new recipe to the database of recipes
// and returns the list of recipes
func AddItemToDB(client *mongo.Client, newItem Item) []Item {
	ctx := DefaultContext()
	_, err := GetItemsCollection(client).InsertOne(ctx, newItem)
	if err != nil {
		log.Fatal(err)
	}
	return GetItemsFromDB(client)
}

// RecipesToString generates a string of the recipes list
func RecipesToString(recipes []Recipe) string {
	data, err := json.Marshal(recipes)
	if err == nil {
		return string(data)
	}
	return ""
}

// GetItemsByRecipes gets all items used in a recipe
func GetItemsByRecipe(recipe Recipe) []string {
	var items = []string{}

	for _, step := range recipe.Steps {
		for _, stepItem := range step.Items {
			items = append(items, stepItem.ItemID)
		}
	}
	return items
}

// FindRecipeById returns the recipe with the given id
func FindRecipeById(client *mongo.Client, recipeId string) Recipe {
	ctx := DefaultContext()
	cursor, err := GetRecipesCollection(client).Find(ctx, bson.M{"_id": recipeId})
	if err != nil {
		log.Fatal(err)
	}

	var recipe Recipe
	cursor.Decode(&recipe)
	return recipe
}

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
			var itemsByRecipe = GetItemsByRecipe(recipe)
			for _, recipeItemID := range itemsByRecipe {
				// add recipe to map if not already added and if itemID corresponds to recipeItemID
				if _, ok := recipesMap[recipe.ID]; !ok && itemID == recipeItemID {
					recipesMap[recipe.ID] = recipe
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

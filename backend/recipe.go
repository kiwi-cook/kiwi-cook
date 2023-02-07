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
	Items       []StepItem `json:"items" bson:"items"`
	Description string     `json:"description" bson:"description"`
}

type StepItem struct {
	Amount int    `json:"amount" bson:"amount"`
	Unit   string `json:"unit,omitempty" bson:"unit,omitempty"`
	ItemID string `json:"itemID" bson:"itemID"`
}

type Item struct {
	ID     primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	string `json:"name" bson:"name" binding:"required"`
	Type   string `json:"type" bson:"type" binding:"required"`
	ImgUrl string `json:"imgUrl,omitempty" bson:"imgUrl,omitempty"`
}

// HandleGetAllRecipes gets called by router
// Calls getRecipesFromDB and handles the context
func HandleGetAllRecipes(context *gin.Context, client *mongo.Client) {
	recipes, err := getAllRecipesFromDB(client)
	if err != nil {
		log.Print(err)
		ServerError(context, true)
		return
	}
	context.JSON(http.StatusOK, recipes)
}

func HandleGetRecipeById(context *gin.Context, client *mongo.Client) {
	id := context.Param("id")

	// convert id to primitive.ObjectID
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		log.Print(err)
		ServerError(context, true)
		return
	}

	recipe, err := getRecipeByIdFromDB(client, objectID)
	if err != nil {
		log.Print(err)
		ServerError(context, true)
		return
	}

	context.JSON(http.StatusOK, recipe)
}

// HandleGetRandomRecipe gets called by router
// Calls getRecipesFromDB and selects a random recipe
func HandleGetRandomRecipe(context *gin.Context, client *mongo.Client) {
	recipes, err := getAllRecipesFromDB(client)
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
func HandleAddRecipe(context *gin.Context, client *mongo.Client) {
	// try to bind json to recipe
	var newRecipe Recipe
	if err := context.BindJSON(&newRecipe); err != nil {
		log.Print(err)
		BadRequestError(context, "Invalid Recipe")
		return
	}

	if err := addOrUpdateRecipeToDB(client, newRecipe); err != nil {
		log.Print(err)
		ServerError(context, true)
		return
	}
	Success(context, "Added recipe")
}

// HandleFindRecipesByItemNames gets called by router
// Calls getRecipesByItemNames and handles the context
func HandleFindRecipesByItemNames(context *gin.Context, client *mongo.Client) {
	itemIds := context.Param("itemIds")

	// split itemIds string into array
	splitItemIds := strings.Split(itemIds, ",")

	recipes, err := getRecipesByItemNames(client, splitItemIds)
	if err != nil {
		log.Print(err)
		ServerError(context, true)
		return
	}
	SuccessJSON(context, recipes)
}

// HandleGetAllItems gets called by router
// Calls getRecipesFromDB and handles the context
func HandleGetAllItems(context *gin.Context, client *mongo.Client) {
	items, err := getAllItemsFromDB(client)
	if err != nil {
		log.Print(err)
		ServerError(context, true)
		return
	}
	SuccessJSON(context, items)
}

// HandleGetItemById gets called by router
// Calls getItemByIdFromDB and handles the context
func HandleGetItemById(context *gin.Context, client *mongo.Client) {
	id := context.Param("id")

	// convert id to primitive.ObjectID
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		log.Print(err)
		ServerError(context, true)
		return
	}

	item, err := getItemByIdFromDB(client, objectID)
	if err != nil {
		log.Print(err)
		ServerError(context, true)
		return
	}

	SuccessJSON(context, item)
}

// HandleAddItem gets called by router
// Calls addItemToDB and handles the context
func HandleAddItem(context *gin.Context, client *mongo.Client) {
	var newItem Item
	if err := context.BindJSON(&newItem); err != nil {
		log.Print(err)
		BadRequestError(context, "Invalid item")
		return
	}

	if err := addItemToDB(client, newItem); err != nil {
		log.Print(err)
		ServerError(context, true)
		return
	}
	Success(context, "Added item")
}

// getRecipesCollection gets recipes collection from database
func getRecipesCollection(client *mongo.Client) *mongo.Collection {
	return client.Database("tastebuddy").Collection("recipes")
}

// getAllRecipesFromDB gets all recipes from database
func getAllRecipesFromDB(client *mongo.Client) ([]Recipe, error) {
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

func getRecipeByIdFromDB(client *mongo.Client, id primitive.ObjectID) (Recipe, error) {
	ctx := DefaultContext()
	// try to get collection of recipes
	recipe := getRecipesCollection(client).FindOne(ctx, bson.M{"_id": id})

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
func addOrUpdateRecipeToDB(client *mongo.Client, newRecipe Recipe) error {
	log.Print(newRecipe)
	ctx := DefaultContext()
	var err error
	if newRecipe.ID.IsZero() {
		// add new recipe
		_, err = getRecipesCollection(client).InsertOne(ctx, newRecipe)
	} else {
		// update recipe
		_, err = getRecipesCollection(client).UpdateOne(ctx,
			bson.D{{Key: "_id", Value: newRecipe.ID}},
			bson.D{{Key: "$set", Value: newRecipe}})
	}
	if err != nil {
		log.Print(err)
		return err
	}

	return nil
}

// getItemsCollection gets recipes from database
func getItemsCollection(client *mongo.Client) *mongo.Collection {
	return client.Database("tastebuddy").Collection("items")
}

// getAllItemsFromDB gets all items from database
func getAllItemsFromDB(client *mongo.Client) ([]Item, error) {
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

// getItemByIdFromDB gets item from database by id
func getItemByIdFromDB(client *mongo.Client, id primitive.ObjectID) (Item, error) {
	ctx := DefaultContext()

	items := getItemsCollection(client).FindOne(ctx, bson.M{"_id": id})

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

// addItemToDB adds a new recipe to the database of recipes
// and returns all items from the database
func addItemToDB(client *mongo.Client, newItem Item) error {
	ctx := DefaultContext()
	_, err := getItemsCollection(client).InsertOne(ctx, newItem)
	if err != nil {
		log.Print(err)
		return err
	}
	return nil
}

// getItemsByRecipe gets all items used in a recipe
func getItemsByRecipe(recipe Recipe) []string {
	var items []string

	for _, step := range recipe.Steps {
		for _, stepItem := range step.Items {
			items = append(items, stepItem.ItemID)
		}
	}
	return items
}

// getRecipeById gets recipe with the given id
func getRecipeById(client *mongo.Client, recipeId string) (Recipe, error) {
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

// getRecipesByItemNames gets the recipes in which the given items are used
func getRecipesByItemNames(client *mongo.Client, splitItemIds []string) ([]Recipe, error) {
	// use map since its easier to avoid duplicates
	var recipesMap = make(map[string]Recipe)

	// get all recipes from database
	recipes, err := getAllRecipesFromDB(client)
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
	var filteredRecipes []Recipe
	for _, recipe := range recipesMap {
		filteredRecipes = append(filteredRecipes, recipe)
	}

	return filteredRecipes, nil
}

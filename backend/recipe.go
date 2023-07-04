/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"errors"
	"fmt"
	"math"
	"math/rand"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type RecipeUpdateType int

const (
	RecipeCreated = iota
	RecipeUpdated
	RecipeNotChanged
)

type Recipe struct {
	ID          primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Name        string             `json:"name" bson:"name" binding:"required"`
	Author      string             `json:"author" bson:"author" binding:"required"`
	Description string             `json:"description" bson:"description" binding:"required"`
	Items       []StepItem         `json:"items,omitempty" bson:"items,omitempty"`
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
	Items                     []StepItem                 `json:"items,omitempty" bson:"items,omitempty"`
	ImgUrl                    string                     `json:"imgUrl,omitempty" bson:"imgUrl,omitempty"`
	Duration                  int                        `json:"duration,omitempty" bson:"duration,omitempty"`
	AdditionalStepInformation *AdditionalStepInformation `json:"additional,omitempty" bson:"additional,omitempty"`
}

func StepFromDescription(description string) Step {
	step := Step{}
	step.Description = description
	step.Items = []StepItem{}
	step.Duration = 0
	step.ImgUrl = ""
	step.AdditionalStepInformation = nil
	return step
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
	Item   `json:",inline,omitempty" bson:",inline,omitempty"`
	Amount float64 `json:"amount" bson:"amount" binding:"required"`
	Unit   string  `json:"unit,omitempty" bson:"unit,omitempty" binding:"required"`
	// nested nameless struct
}

// HandleGetAllRecipes gets called by router
// Calls getRecipesFromDB and handles the context
func (server *TasteBuddyServer) HandleGetAllRecipes(context *gin.Context) {
	recipes, err := server.GetAllRecipes()
	if err != nil {
		server.LogError("HandleGetAllRecipes", err)
		ServerError(context, true)
		return
	}
	Success(context, recipes)
}

func (server *TasteBuddyServer) HandleGetRecipeById(context *gin.Context) {
	id := context.Param("id")

	// convert id to primitive.ObjectID
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		server.LogError("HandleGetRecipeById", err)
		ServerError(context, true)
		return
	}

	recipe, err := server.GetRecipeById(objectID)
	if err != nil {
		server.LogError("HandleGetRecipeById", err)
		ServerError(context, true)
		return
	}
	Success(context, recipe)
}

// HandleGetRandomRecipe gets called by router
// Calls getRecipesFromDB and selects a random recipe
func (server *TasteBuddyServer) HandleGetRandomRecipe(context *gin.Context) {
	recipes, err := server.GetAllRecipes()
	if err != nil {
		server.LogError("HandleGetRandomRecipe", err)
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
	Success(context, recipes[randomIndex])
}

// HandleAddRecipe gets called by router
// Calls addRecipeToDB and handles the context
func (server *TasteBuddyServer) HandleAddRecipe(context *gin.Context) {
	server.LogContextHandle(context, "HandleAddRecipe", "Trying to add/update recipe")

	// try to bind json to recipe
	var newRecipe Recipe
	if err := context.BindJSON(&newRecipe); err != nil {
		server.LogError("HandleAddRecipe", err)
		BadRequestError(context, err.Error())
		return
	}

	var recipeId primitive.ObjectID
	var err error
	var recipeUpdateType RecipeUpdateType
	if recipeId, recipeUpdateType, err = server.AddOrUpdateRecipe(newRecipe); err != nil {
		server.LogError("HandleAddRecipe", err)
		ServerError(context, false)
		return
	}
	server.LogContextHandle(context, "HandleAddRecipe", "Added/Updated recipe "+newRecipe.Name+" ("+newRecipe.ID.Hex()+")")
	if recipeUpdateType == RecipeCreated {
		Created(context, "recipe", recipeId)
	} else {
		Updated(context, "recipe", recipeId)
	}
}

// HandleDeleteRecipeById gets called by router
// Calls DeleteRecipeById and handles the context
func (server *TasteBuddyServer) HandleDeleteRecipeById(context *gin.Context) {
	id := context.Param("id")
	server.LogContextHandle(context, "HandleDeleteRecipeById", "Trying to delete recipe "+id)

	// convert id to primitive.ObjectID
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		server.LogError("HandleDeleteRecipeById", err)
		ServerError(context, true)
		return
	}

	// delete recipe
	if _, err := server.DeleteRecipeById(objectID); err != nil {
		server.LogError("HandleDeleteRecipeById", err)
		ServerError(context, true)
		return
	}
	server.LogContextHandle(context, "HandleDeleteRecipeById", "Deleted recipe "+id)
	Success(context, "Deleted recipe "+id)
}

// GetRecipesCollection gets recipes collection from database
func (app *TasteBuddyApp) GetRecipesCollection() *TBCollection {
	return app.GetDBCollection("recipes")
}

// GetAllRecipes gets all recipes from database
func (app *TasteBuddyApp) GetAllRecipes() ([]Recipe, error) {
	var recipesFromDatabase []Recipe
	app.LogDebug("GetAllRecipes", "Getting all recipes from database")
	if err := app.GetRecipesCollection().AllWithDefault(bson.M{"deleted": bson.M{"$ne": true}}, &recipesFromDatabase, []Recipe{}); err != nil {
		return []Recipe{}, app.LogError("GetAllRecipes", err)
	}

	items, err := app.GetAllItems()
	if err != nil {
		return []Recipe{}, app.LogError("GetAllRecipes", err)
	}

	// prepare items for each recipe
	// create map of items
	itemsMap := make(map[primitive.ObjectID]Item)
	for i := range items {
		itemsMap[items[i].ID] = items[i]
	}
	for i := range recipesFromDatabase {
		recipesFromDatabase[i].MapItemIdsToItem(itemsMap)
	}

	return recipesFromDatabase, nil
}

func (recipe *Recipe) MapItemIdsToItem(itemsMap map[primitive.ObjectID]Item) {
	// replace item ids with items
	for i := range recipe.Steps {
		for j := range recipe.Steps[i].Items {
			recipe.Steps[i].Items[j].Item = itemsMap[recipe.Steps[i].Items[j].ID]
		}
	}
}

func (app *TasteBuddyApp) GetRecipeById(id primitive.ObjectID) (Recipe, error) {
	var recipeFromDatabase Recipe
	app.LogDebug("GetRecipeById", "Getting recipe with id "+id.Hex())
	err := app.GetRecipesCollection().FindOneWithDefault(bson.M{"_id": id}, &recipeFromDatabase, Recipe{})
	return recipeFromDatabase, err
}

// AddOrUpdateRecipe adds a new recipe to the database of recipes
// and returns all the id of the new recipe or the old recipe
func (app *TasteBuddyApp) AddOrUpdateRecipe(newRecipe Recipe) (primitive.ObjectID, RecipeUpdateType, error) {
	ctx := DefaultContext()
	var err error
	var objectId primitive.ObjectID
	var recipeUpdateType RecipeUpdateType

	// get the items from the recipe and add them to the database
	newRecipe, err = app.PrepareRecipeForDB(newRecipe)
	if err != nil {
		return objectId, RecipeNotChanged, app.LogError("AddOrUpdateRecipe + recipe "+newRecipe.Name, err)
	}

	if newRecipe.ID.IsZero() {
		// add new recipe
		// set createdAt to current time
		app.LogWarning("AddOrUpdateRecipe + recipe "+newRecipe.Name, "Add new recipe to database")
		var result *mongo.InsertOneResult
		newRecipe.Props.CreatedAt = time.Now()
		result, err = app.GetRecipesCollection().InsertOne(ctx, newRecipe)
		objectId = result.InsertedID.(primitive.ObjectID)
		recipeUpdateType = RecipeCreated
	} else {
		fmt.Printf("newRecipe %+v\n", newRecipe)
		// update recipe
		app.LogWarning("AddOrUpdateRecipe + recipe "+newRecipe.Name+"("+newRecipe.ID.Hex()+")", "Update existing recipe in database")
		_, err = app.GetRecipesCollection().UpdateOne(ctx,
			bson.D{{Key: "_id", Value: newRecipe.ID}},
			bson.D{{Key: "$set", Value: newRecipe}})
		objectId = newRecipe.ID
		recipeUpdateType = RecipeUpdated
	}
	if err != nil {
		return objectId, RecipeNotChanged, app.LogError("AddOrUpdateRecipe + recipe "+newRecipe.Name+"("+objectId.Hex()+")", err)
	}

	app.LogWarning("AddOrUpdateRecipe + recipe "+newRecipe.Name+"("+objectId.Hex()+")", "Successful operation")
	return objectId, recipeUpdateType, nil
}

func (app *TasteBuddyApp) DeleteRecipeById(id primitive.ObjectID) (primitive.ObjectID, error) {
	ctx := DefaultContext()

	// delete recipe by setting deleted to true
	app.LogWarning("DeleteRecipeById", "Delete recipe "+id.Hex()+" from database")
	if _, err := app.GetRecipesCollection().UpdateByID(ctx, id, bson.D{{Key: "$set", Value: bson.D{{Key: "deleted", Value: true}}}}); err != nil {
		return id, app.LogError("DeleteRecipeById", err)
	}

	return id, nil
}

func (app *TasteBuddyApp) PrepareRecipeForDB(recipe Recipe) (Recipe, error) {
	fmt.Printf("PrepareRecipeForDB + recipe %+v\n", recipe)

	// normalize all items in recipe
	for stepIndex, step := range recipe.Steps {
		for itemIndex, stepItem := range step.Items {
			var err error

			// if item in stepItem has an id, it is already in the database
			itemId, err := app.AddOrUpdateItem(stepItem.Item)
			if err != nil {
				return recipe, app.LogError("PrepareForDB + "+recipe.Name+" + "+stepItem.Name, err)
			}
			app.Log("PrepareForDB + recipe "+recipe.Name+"("+recipe.ID.Hex()+")", "Map "+stepItem.Name+" to "+itemId.Hex())
			stepItem.ID = itemId
			recipe.Steps[stepIndex].Items[itemIndex] = stepItem
		}
	}

	fmt.Printf("PrepareRecipeForDB + recipe %+v + finished\n", recipe)
	return recipe, nil
}

// GetRecipesByItemNames gets the recipes in which the given items are used
func (app *TasteBuddyApp) GetRecipesByItemNames(splitItemIds []string) ([]Recipe, error) {
	// use map since its easier to avoid duplicates
	var recipesMap = make(map[string]Recipe)

	// get all recipes from database
	recipes, err := app.GetAllRecipes()
	if err != nil {
		return []Recipe{}, app.LogError("GetRecipesByItemNames", err)
	}

	for _, itemID := range splitItemIds {
		for _, recipe := range recipes {
			// iterate through each item used in recipe
			var itemsByRecipe = recipe.GetItems()
			for _, recipeItem := range itemsByRecipe {
				// add recipe to map if not already added and if itemID corresponds to recipeID
				if _, ok := recipesMap[recipe.ID.Hex()]; !ok && itemID == recipeItem.ID.Hex() {
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

// GetStepItemsList returns a list of all items used in the recipe
func (recipe *Recipe) GetStepItemsList() []StepItem {
	var stepItems []StepItem
	for _, step := range recipe.Steps {
		stepItems = append(stepItems, step.Items...)
	}
	return stepItems
}

// GetStepItems returns a map of all items used in the recipe
func (recipe *Recipe) GetStepItems() map[primitive.ObjectID]StepItem {
	var stepItems = make(map[primitive.ObjectID]StepItem)
	for _, stepItem := range recipe.GetStepItemsList() {
		stepItems[stepItem.ID] = stepItem
	}
	return stepItems
}

// CalculateLowestRecipePriceInCity calculates the lowest price of a recipe for a city
func (app *TasteBuddyApp) CalculateLowestRecipePriceInCity(recipe *Recipe, city string) (float64, *Market, error) {
	markets, err := app.GetMarketsByCity(city)
	if err != nil {
		app.LogError("CalculateRecipePriceInCity", err)
		return 0, nil, err
	}

	// Create channel for price calculation
	priceChannel := make(chan *struct {
		price  float64
		market *Market
	})
	for _, market := range markets {
		go func(recipe *Recipe, market Market) {
			price, successful := app.CalculateRecipePriceForMarket(recipe, market)
			if !successful {
				priceChannel <- nil
				return
			}
			priceChannel <- &struct {
				price  float64
				market *Market
			}{price, &market}
		}(recipe, market)
	}

	// Wait for all markets to be found
	var lowestPrice = math.MaxFloat64
	var lowestPriceMarket Market
	successful := false
	for i := 0; i < len(markets); i++ {
		priceMarket := <-priceChannel
		// skip nil values
		if priceMarket == nil {
			continue
		}
		if priceMarket.price < lowestPrice {
			lowestPrice = priceMarket.price
			lowestPriceMarket = *priceMarket.market
			successful = true
		}
	}

	if !successful {
		return 0, nil, app.LogError("CalculateRecipePriceInCity", errors.New("no market found for "+recipe.Name+" in "+city))
	}
	app.LogDebug("CalculateRecipePriceInCity", "Lowest price for "+recipe.Name+" in "+city+" is "+fmt.Sprintf("%.2f", lowestPrice)+" at "+lowestPriceMarket.MarketName)
	return lowestPrice, &lowestPriceMarket, nil
}

// CalculateRecipePriceForMarket calculates the price of a recipe for a market
func (app *TasteBuddyApp) CalculateRecipePriceForMarket(recipe *Recipe, market Market) (float64, bool) {
	var price float64 = 0
	stepItems := recipe.GetStepItemsList()
	for _, stepItem := range stepItems {
		discountPrice, _ := app.CalculateItemPriceForMarket(&stepItem.Item, market)
		price += discountPrice * stepItem.Amount
	}
	return math.Max(price, 0), price > 0
}

// CleanUpItemsInRecipes removes all items from recipes that are not in the database
// and replaces them with the best item from the database
func (app *TasteBuddyApp) CleanUpItemsInRecipes() error {
	var err error

	var items []Item
	var recipes []Recipe

	// get items
	items, err = app.GetAllItems()
	if err != nil {
		return app.LogError("CleanUpItemsInRecipes", err)
	}

	// create map of the "best" item for each name
	var itemMap = make(map[string]Item)
	for _, item := range items {
		// check if map already contains item
		if itemFromMap, ok := itemMap[item.Name]; ok {
			// check if item is better than item in map
			if item.GetItemQuality() > itemFromMap.GetItemQuality() {
				// replace item in map
				itemMap[item.Name] = item
				app.Log("CleanUpItemsInRecipes", fmt.Sprintf("replace %s with %s", itemFromMap.ID.Hex(), item.ID.Hex()))
			}
		} else {
			// add item to map
			itemMap[item.Name] = item
		}
	}

	// get recipes
	recipes, err = app.GetAllRecipes()
	if err != nil {
		return app.LogError("CleanUpItemsInRecipes", err)
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
					stepItem.ID = item.ID
					recipe.Steps[stepIndex].Items[itemIndex] = stepItem
					amountCleanedUp++
				}
			}
		}
	}

	// update recipes
	for _, recipe := range recipes {
		if _, _, err = app.AddOrUpdateRecipe(recipe); err != nil {
			return app.LogError("CleanUpItemsInRecipes", err)
		}
	}

	app.Log("CleanUpItemsInRecipes", fmt.Sprintf("Clean up %d recipes...", amountCleanedUp))

	return nil
}

// CleanUpUnusedAttributesInRecipes marshals and unmarshal all recipes and
// tries to remove all unused attributes
func (app *TasteBuddyApp) CleanUpUnusedAttributesInRecipes() error {
	recipes, err := app.GetAllRecipes()
	if err != nil {
		return app.LogError("CleanUpUnusedAttributesInRecipes", err)
	}

	for _, recipe := range recipes {
		if _, _, err := app.AddOrUpdateRecipe(recipe); err != nil {
			return app.LogError("CleanUpUnusedAttributesInRecipes", err)
		}
	}

	return nil
}

// GoRoutineCleanUpRecipes contains goroutines that are called every 6 hours
// to clean up parts of the recipes
func (app *TasteBuddyApp) GoRoutineCleanUpRecipes() {
	for {
		app.CleanUpItemsInRecipes()
		app.CleanUpUnusedAttributesInRecipes()
		// clean up recipes every 7 days
		time.Sleep(7 * 24 * time.Hour)
	}
}

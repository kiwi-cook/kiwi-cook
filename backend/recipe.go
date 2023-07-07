/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"errors"
	"fmt"
	"github.com/adrg/strutil"
	"github.com/adrg/strutil/metrics"
	"math"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Recipe struct {
	ID          primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Name        string             `json:"name" bson:"name" binding:"required"`
	Author      string             `json:"author" bson:"author" binding:"required"`
	Description string             `json:"description" bson:"description" binding:"required"`
	// Items       []StepItem         `json:"items,omitempty" bson:"items,omitempty"`
	Steps []Step `json:"steps" bson:"steps" binding:"required"`
	Props struct {
		Url       string    `json:"url,omitempty" bson:"url,omitempty"`
		ImgUrl    string    `json:"imgUrl,omitempty" bson:"imgUrl,omitempty"`
		Duration  int       `json:"duration,omitempty" bson:"duration,omitempty"`
		CreatedAt time.Time `json:"createdAt,omitempty" bson:"createdAt,omitempty"`
		Tags      []string  `json:"tags,omitempty" bson:"tags,omitempty"`
		Likes     int       `json:"likes,omitempty" bson:"likes,omitempty"`
		Copyright string    `json:"copyRight,omitempty" bson:"copyRight,omitempty"`
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

type StepItemResult struct {
	StepItem
	error   error
	success bool `json:"success"`
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
	if err = server.AddOrUpdateRecipe(newRecipe); err != nil {
		server.LogError("HandleAddRecipe", err)
		ServerError(context, false)
		return
	}

	Updated(context, "recipe", recipeId)
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
	var recipesFromDatabase = make([]Recipe, 0)
	app.LogDatabase("GetAllRecipes", "Getting all recipes from database")
	if err := app.GetRecipesCollection().AllWithDefault(bson.M{"deleted": bson.M{"$ne": true}}, &recipesFromDatabase, []Recipe{}); err != nil {
		return []Recipe{}, app.LogError("GetAllRecipes", err)
	}

	app.LogDatabase("GetAllRecipes", "Got all items from database")
	items, err := app.GetAllItems(false)
	if err != nil {
		return []Recipe{}, app.LogError("GetAllRecipes", err)
	}

	// prepare items for each recipe
	// create map of items
	itemsMap := make(map[primitive.ObjectID]Item)
	for i := range items {
		itemsMap[items[i].ID] = items[i]
	}

	if len(recipesFromDatabase) == 0 || recipesFromDatabase == nil {
		recipesFromDatabase = []Recipe{}
	}

	return recipesFromDatabase, nil
}

// MapItemNamesToItems maps item names to items
func (recipe *Recipe) MapItemNamesToItems() map[string]Item {
	itemNamesToItems := make(map[string]Item)
	for _, item := range recipe.GetItems() {
		itemNamesToItems[item.Name] = item
	}
	return itemNamesToItems
}

// GetRecipeById gets recipe by id from database
func (app *TasteBuddyApp) GetRecipeById(id primitive.ObjectID) (Recipe, error) {
	var recipeFromDatabase Recipe
	app.LogDebug("GetRecipeById", "Getting recipe with id "+id.Hex())
	err := app.GetRecipesCollection().FindOneWithDefault(bson.M{"_id": id}, &recipeFromDatabase, Recipe{})
	return recipeFromDatabase, err
}

// AddOrUpdateRecipe adds or updates recipe in database
func (app *TasteBuddyApp) AddOrUpdateRecipe(recipe Recipe) error {
	return app.AddOrUpdateRecipes([]Recipe{recipe})
}

// AddOrUpdateRecipes adds or updates recipes in database
func (app *TasteBuddyApp) AddOrUpdateRecipes(recipes []Recipe) error {
	app.Log("AddOrUpdateRecipes", "Adding or updating "+strconv.Itoa(len(recipes))+" recipes")
	var recipesWithIds []interface{}
	var recipesWithoutIds []interface{}

	// Split recipes into recipes with and without ids
	for _, recipe := range recipes {
		if recipe.ID.IsZero() {
			recipesWithoutIds = append(recipesWithoutIds, recipe)
		} else {
			recipesWithIds = append(recipesWithIds, recipe)
		}
	}

	// Add recipes without ids to database
	if len(recipesWithoutIds) > 0 {
		if _, err := app.GetRecipesCollection().InsertMany(DefaultContext(), recipesWithoutIds); err != nil {
			return err
		}
		app.Log("AddOrUpdateRecipes", "Added "+strconv.Itoa(len(recipesWithoutIds))+" recipes without ids to database")
	}

	// Update recipes with ids in database
	for _, recipe := range recipesWithIds {
		if _, err := app.GetRecipesCollection().UpdateByID(DefaultContext(), recipe.(Recipe).ID, recipe); err != nil {
			return err
		}
	}
	app.Log("AddOrUpdateRecipes", "Updated "+strconv.Itoa(len(recipesWithIds))+" recipes with ids in database")
	return nil
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

// AddItemIdsToRecipes adds item ids to recipes
func (app *TasteBuddyApp) AddItemIdsToRecipes(recipes []Recipe, items map[string]Item) []Recipe {
	for _, recipe := range recipes {
		// Add item ids to recipe
		for stepIndex, step := range recipe.Steps {
			for itemIndex, stepItem := range step.Items {
				// if item in stepItem has an id, it is already in the database
				stepItem.ID = items[stepItem.Name].ID
				recipe.Steps[stepIndex].Items[itemIndex] = stepItem
			}
		}
	}
	return recipes
}

// GetStepItemsList returns a list of all items used in the recipe
func (recipe *Recipe) GetStepItemsList() []StepItem {
	var stepItems []StepItem
	for _, step := range recipe.Steps {
		stepItems = append(stepItems, step.Items...)
	}
	return stepItems
}

// GetStepItemsMappedToId returns a map of all items used in the recipe
func (recipe *Recipe) GetStepItemsMappedToId() map[primitive.ObjectID]StepItem {
	var stepItems = make(map[primitive.ObjectID]StepItem)
	for _, stepItem := range recipe.GetStepItemsList() {
		stepItems[stepItem.ID] = stepItem
	}
	return stepItems
}

// GetStepItemsMappedToName returns a map of all items used in the recipe
func (recipe *Recipe) GetStepItemsMappedToName() map[string]StepItem {
	var stepItems = make(map[string]StepItem)
	for _, stepItem := range recipe.GetStepItemsList() {
		stepItems[stepItem.Name] = stepItem
	}
	return stepItems
}

// MatchItemToStepItem selects the most similar item from the given step items
func (app *TasteBuddyApp) MatchItemToStepItem(item Item, stepItems []StepItem, threshold float64) StepItemResult {
	var mostSimilarItem StepItem
	var mostSimilarity float64 = 0
	for _, stepItem := range stepItems {
		if similarity := strutil.Similarity(item.Name, stepItem.Name, metrics.NewHamming()); similarity >= threshold && similarity > mostSimilarity {
			app.LogDebug("MatchItemToStepItem", "Found most similar step item "+stepItem.Name+" to "+item.Name+" with similarity "+fmt.Sprintf("%f", similarity))
			mostSimilarItem = stepItem
			mostSimilarity = similarity
		}
	}

	if mostSimilarity == 0 {
		app.LogDebug("MatchItemToStepItem", "No similar step item found for "+item.Name)
		return StepItemResult{StepItem: StepItem{}, success: false}
	}

	return StepItemResult{StepItem: mostSimilarItem, success: true}
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
	items, err = app.GetAllItems(false)
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
	if err = app.AddOrUpdateRecipes(recipes); err != nil {
		return app.LogError("CleanUpItemsInRecipes", err)
	}

	app.Log("CleanUpItemsInRecipes", fmt.Sprintf("Clean up %d recipes...", amountCleanedUp))

	return nil
}

// CleanUpUnusedAttributesInRecipes marshals and unmarshal all recipes and
// tries to remove all unused attributes
func (app *TasteBuddyApp) CleanUpUnusedAttributesInRecipes() error {
	var err error
	var recipes []Recipe

	if recipes, err = app.GetAllRecipes(); err != nil {
		return app.LogError("CleanUpUnusedAttributesInRecipes", err)
	}

	if err = app.AddOrUpdateRecipes(recipes); err != nil {
		return app.LogError("CleanUpUnusedAttributesInRecipes", err)
	}
	return nil
}

// GoRoutineCleanUpRecipes contains goroutines that are called every 6 hours
// to clean up parts of the recipes
func (app *TasteBuddyApp) GoRoutineCleanUpRecipes() error {
	for {
		if err := app.CleanUpItemsInRecipes(); err != nil {
			return app.LogError("GoRoutineCleanUpRecipes", err)
		}
		if err := app.CleanUpUnusedAttributesInRecipes(); err != nil {
			return app.LogError("GoRoutineCleanUpRecipes", err)
		}
		// clean up recipes every 7 days
		time.Sleep(7 * 24 * time.Hour)
	}
}

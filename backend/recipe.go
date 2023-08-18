/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Recipe struct {
	ID          primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Name        string             `json:"name" bson:"name" binding:"required"`
	Author      string             `json:"author" bson:"author"`
	Authors     []string           `json:"authors" bson:"authors"`
	Description string             `json:"description" bson:"description"`
	Steps       []Step             `json:"steps" bson:"steps" binding:"required"`
	Props       struct {
		Url       string    `json:"url,omitempty" bson:"url,omitempty"`
		ImgUrl    string    `json:"imgUrl,omitempty" bson:"imgUrl,omitempty"`
		Duration  int       `json:"duration,omitempty" bson:"duration,omitempty"`
		CreatedAt time.Time `json:"createdAt,omitempty" bson:"createdAt,omitempty"`
		Tags      []string  `json:"tags,omitempty" bson:"tags,omitempty"`
		Copyright string    `json:"copyRight,omitempty" bson:"copyRight,omitempty"`
	} `json:"props,omitempty" bson:"props,omitempty"`
	Deleted bool `json:"-" bson:"deleted,omitempty"`
}

type Step struct {
	Description string     `json:"description" bson:"description" binding:"required"`
	Items       []StepItem `json:"items,omitempty" bson:"items,omitempty"`
	ImgUrl      string     `json:"imgUrl,omitempty" bson:"imgUrl,omitempty"`
	Duration    int        `json:"duration,omitempty" bson:"duration,omitempty"`
	Temperature int        `json:"temperature,omitempty" bson:"temperature,omitempty"`
}

type StepItem struct {
	// nested nameless struct
	Item   `json:",inline,omitempty" bson:",inline,omitempty"`
	Amount float64 `json:"amount" bson:"amount" binding:"required"`
	Unit   string  `json:"unit,omitempty" bson:"unit,omitempty" binding:"required"`
}

// HandleGetAllRecipes gets called by server
// Calls getRecipesFromDB and handles the context
func (server *TasteBuddyServer) HandleGetAllRecipes(context *gin.Context) {
	recipes, err := server.GetAllRecipes()
	if err != nil {
		server.LogError("HandleGetAllRecipes.GetAllRecipes", err)
		ServerError(context, true)
		return
	}
	Success(context, recipes)
}

// HandleAddRecipes gets called by server
// Adds or updates recipes in database
func (server *TasteBuddyServer) HandleAddRecipes(context *gin.Context) {
	server.LogContextHandle(context, "HandleAddRecipe", "Trying to add/update recipe")

	// Bind JSON to list of recipes
	var recipes []Recipe
	if err := context.BindJSON(&recipes); err != nil {
		server.LogError("HandleAddRecipe.BindJSON", err)
		BadRequestError(context, err.Error())
		return
	}

	if err := server.AddRecipes(recipes); err != nil {
		server.LogError("HandleAddRecipe.AddRecipe", err)
		ServerError(context, false)
		return
	}

	Updated(context, "recipe")
}

// HandleDeleteRecipeById gets called by server
// Calls DeleteRecipeById and handles the context
func (server *TasteBuddyServer) HandleDeleteRecipeById(context *gin.Context) {
	id := context.Param("id")
	server.LogContextHandle(context, "HandleDeleteRecipeById", "Trying to delete recipe "+id)

	// convert id to primitive.ObjectID
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		server.LogError("HandleDeleteRecipeById.ObjectIDFromHex", err)
		ServerError(context, true)
		return
	}

	// delete recipe
	if _, err := server.DeleteRecipeById(objectID); err != nil {
		server.LogError("HandleDeleteRecipeById.DeleteRecipeById", err)
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
		return []Recipe{}, app.LogError("GetAllRecipes.AllWithDefault", err)
	}

	app.LogDatabase("GetAllRecipes", "Got all items from database")
	items, err := app.GetAllItems(false)
	if err != nil {
		return []Recipe{}, app.LogError("GetAllRecipes.GetAllItems", err)
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

// GetRecipeById gets recipe by id from database
func (app *TasteBuddyApp) GetRecipeById(id primitive.ObjectID) (Recipe, error) {
	var recipeFromDatabase Recipe
	app.LogDebug("GetRecipeById", "Getting recipe with id "+id.Hex())
	err := app.GetRecipesCollection().FindOneWithDefault(bson.M{"_id": id}, &recipeFromDatabase, Recipe{})
	if err != nil {
		return Recipe{}, app.LogError("GetRecipeById.FindOneWithDefault", err)
	}
	return recipeFromDatabase, err
}

// AddRecipes adds or updates recipes in database
// 1. Add or update items of recipes in database
// 2. Get items from database
// 3. Set item ids to recipes
// 4. Sort recipes into recipes with and without ids
// 5. Add recipes to database
func (app *TasteBuddyApp) AddRecipes(recipes []Recipe) error {

	// Prepare recipes
	var recipesWithIds []interface{}
	var recipesWithoutIds []interface{}

	// 1. Add or update items of recipes in database
	app.Log("AddRecipes", "Add or update items of recipes in database")
	var items []Item
	for _, recipe := range recipes {
		// Add items from recipe to items
		items = append(items, recipe.GetItems()...)
	}

	if _, err := app.AddOrUpdateItems(items); err != nil {
		return app.LogError("AddRecipes.AddOrUpdateItems", err)
	}

	// 2. Get items from database
	app.Log("AddRecipes.GetAllItems", "Get items from database")
	items, err := app.GetAllItems(false)
	if err != nil {
		return app.LogError("AddRecipes.GetAllItems", err)
	}

	// 3. Set item ids to recipes
	app.Log("AddRecipes.AddItemIdsToRecipes", "Set item ids to recipes")
	recipes = AddItemIdsToRecipes(recipes, items)

	// 4. Sort recipes into recipes with and without ids
	app.Log("AddRecipes", "Sort recipes into recipes with and without ids")
	for _, recipe := range recipes {
		// Add recipes with ids to recipesWithIds
		// and recipes without ids to recipesWithoutIds
		if !recipe.ID.IsZero() {
			recipesWithIds = append(recipesWithIds, recipe)
		} else {
			recipesWithoutIds = append(recipesWithoutIds, recipe)
		}
	}

	// 5. Add recipes to database
	// Add recipes without ids to database
	if len(recipesWithoutIds) > 0 {
		if _, err := app.GetRecipesCollection().InsertMany(DefaultContext(), recipesWithoutIds); err != nil {
			return app.LogError("AddRecipes.InsertMany", err)
		}
		app.Log("AddRecipes.InsertMany", "Added "+strconv.Itoa(len(recipesWithoutIds))+" recipes without ids to database")
	}

	// Update recipes with ids in database
	for _, recipe := range recipesWithIds {
		app.Log("AddRecipes", "Updating recipe with id "+recipe.(Recipe).ID.Hex())
		if result, err := app.GetRecipesCollection().UpdateOne(DefaultContext(), bson.M{"_id": recipe.(Recipe).ID}, bson.M{"$set": recipe}); err != nil {
			return app.LogError("AddRecipes.UpdateByID", err)
		} else {
			app.Log("AddRecipes.UpdateOne", "Updated "+strconv.Itoa(int(result.ModifiedCount))+" recipes with id "+recipe.(Recipe).ID.Hex())
		}
	}
	app.Log("AddRecipes", "Updated "+strconv.Itoa(len(recipesWithIds))+" recipes with ids in database")
	return nil
}

// AddItemIdsToRecipes adds item ids to recipes
func AddItemIdsToRecipes(recipes []Recipe, items []Item) []Recipe {
	// Create map of items
	var itemsMap = make(map[string]Item)
	for _, item := range items {
		itemsMap[item.Name] = item
	}

	for _, recipe := range recipes {
		// Add item ids to recipe
		for stepIndex, step := range recipe.Steps {
			for itemIndex, stepItem := range step.Items {
				// if item in stepItem has an id, it is already in the database
				stepItem.ID = itemsMap[stepItem.Name].ID
				recipe.Steps[stepIndex].Items[itemIndex] = stepItem
			}
		}
	}
	return recipes
}

// DeleteRecipeById deletes recipe by id from database
func (app *TasteBuddyApp) DeleteRecipeById(id primitive.ObjectID) (primitive.ObjectID, error) {
	ctx := DefaultContext()

	// Delete recipe by setting "deleted" to true
	app.Log("DeleteRecipeById", "Delete recipe "+id.Hex()+" from database")
	if _, err := app.GetRecipesCollection().UpdateByID(ctx, id, bson.D{{Key: "$set", Value: bson.D{{Key: "deleted", Value: true}}}}); err != nil {
		return id, app.LogError("DeleteRecipeById.UpdateByID", err)
	}

	return id, nil
}

// RecoverRecipeById recovers recipe by id from database
func (app *TasteBuddyApp) RecoverRecipeById(id primitive.ObjectID) (primitive.ObjectID, error) {
	ctx := DefaultContext()

	// Recover recipe by setting "deleted" to false
	app.Log("RecoverRecipeById", "Recover recipe "+id.Hex()+" from database")
	if _, err := app.GetRecipesCollection().UpdateByID(ctx, id, bson.D{{Key: "$set", Value: bson.D{{Key: "deleted", Value: false}}}}); err != nil {
		return id, app.LogError("RecoverRecipeById.UpdateByID", err)
	}

	return id, nil
}

// GetItems gets all items used in a recipe
// They are unique
func (recipe *Recipe) GetItems() []Item {
	// Create map of items
	var stepItemsMap = make(map[string]StepItem)
	for _, stepItem := range recipe.GetStepItemsList() {
		stepItemsMap[stepItem.Name] = stepItem
	}

	// Convert map to array
	var items []Item
	for _, item := range stepItemsMap {
		items = append(items, item.Item)
	}
	return items
}

// GetStepItemsList returns a list of all StepItem used in the recipe
func (recipe *Recipe) GetStepItemsList() []StepItem {
	var stepItems []StepItem
	for _, step := range recipe.Steps {
		stepItems = append(stepItems, step.Items...)
	}
	return stepItems
}

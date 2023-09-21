/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"errors"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

type Recipe struct {
	ID          primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Name        LocalizedString    `json:"name,omitempty" bson:"name,omitempty"`
	Description LocalizedString    `json:"desc" bson:"description"`
	Steps       []Step             `json:"steps" bson:"steps" binding:"required"`
	Props       struct {
		ImgUrl    string    `json:"imgUrl,omitempty" bson:"imgUrl,omitempty"`
		Duration  int       `json:"duration,omitempty" bson:"duration,omitempty"`
		CreatedAt time.Time `json:"date,omitempty" bson:"date,omitempty"`
		Tags      []string  `json:"tags,omitempty" bson:"tags,omitempty"`
	} `json:"props,omitempty" bson:"props,omitempty"`
	Source struct {
		Url     string `json:"url,omitempty" bson:"url,omitempty"`
		Authors []struct {
			Name string `json:"name" bson:"name" binding:"required"`
			Url  string `json:"url,omitempty" bson:"url,omitempty"`
		} `json:"authors,omitempty" bson:"authors,omitempty"`
		Copyright string `json:"cr,omitempty" bson:"copyright,omitempty"`
		CookBook  struct {
			Name      string `json:"name,omitempty" bson:"name,omitempty""`
			Url       string `json:"url,omitempty" bson:"url,omitempty"`
			Publisher string `json:"pub,omitempty" bson:"publisher,omitempty"`
		} `json:"cookBook,omitempty" bson:"cookBook,omitempty"`
	} `json:"src,omitempty" bson:"source,omitempty"`
	Deleted bool `json:"-" bson:"deleted,omitempty"`
}

type Step struct {
	Description LocalizedString `json:"desc" bson:"description" binding:"required"`
	Items       []StepItem      `json:"items,omitempty" bson:"items,omitempty"`
	ImgUrl      string          `json:"imgUrl,omitempty" bson:"imgUrl,omitempty"`
	Duration    int             `json:"duration,omitempty" bson:"duration,omitempty"`
	Temperature float32         `json:"temperature,omitempty" bson:"temperature,omitempty"`
}

type StepItem struct {
	ID     primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Amount float64            `json:"quantity" bson:"amount" binding:"required"`
	Unit   string             `json:"unit,omitempty" bson:"unit,omitempty" binding:"required"`
}

// HandleGetRecipes gets called by server
// Calls getRecipesFromDB and handles the context
func (server *TasteBuddyServer) HandleGetRecipes(context *gin.Context) {
	recipes, err := server.GetRecipes(true)
	if err != nil {
		server.LogError("HandleGetRecipes.GetRecipes", err)
		ServerError(context, true)
		return
	}
	Success(context, recipes)
}

// HandleAddRecipes gets called by server
// Adds or updates recipes in database
func (server *TasteBuddyServer) HandleAddRecipes(context *gin.Context) {
	server.LogContextHandle(context, "HandleAddRecipes", "Add/update recipes")

	// Bind JSON to list of recipes
	var recipes []Recipe
	if err := context.BindJSON(&recipes); err != nil {
		server.LogError("HandleAddRecipes.BindJSON", err)
		BadRequestError(context, err.Error())
		return
	}

	if err := server.AddRecipes(recipes); err != nil {
		server.LogError("HandleAddRecipes.AddRecipe", err)
		ServerError(context, false)
		return
	}

	Updated(context, "recipe")
}

// HandleDeleteRecipes gets called by server
// Calls DeleteRecipes and handles the context
func (server *TasteBuddyServer) HandleDeleteRecipes(context *gin.Context) {
	server.LogContextHandle(context, "HandleAddRecipes", "Delete recipes")

	// Bind JSON to list of recipe ids
	var recipeIds []string
	if err := context.BindJSON(&recipeIds); err != nil {
		server.LogError("HandleDeleteRecipes.BindJSON", err)
		BadRequestError(context, err.Error())
		return
	}

	// Delete recipes
	if err := server.DeleteRecipes(recipeIds); err != nil {
		server.LogError("HandleDeleteRecipes.DeleteRecipes", err)
		ServerError(context, true)
		return
	}

	msg := "Deleted " + strconv.Itoa(len(recipeIds)) + " recipes"
	server.LogContextHandle(context, "HandleDeleteRecipes", msg)
	Success(context, msg)
}

var (
	cachedRecipes    []Recipe
	cachedRecipesAge int64
)

// GetRecipesCollection gets recipes collection from database
func (app *TasteBuddyApp) GetRecipesCollection() *TBCollection {
	return app.GetDBCollection("recipes")
}

// UpdateRecipeCache updates the recipe cache
func (app *TasteBuddyApp) UpdateRecipeCache() error {
	app.LogTrace("UpdateRecipeCache", "Update recipe cache")
	if _, err := app.GetRecipes(false); err != nil {
		return app.LogError("UpdateRecipeCache.GetRecipes", err)
	}
	return nil
}

// GetRecipes gets all recipes from database
func (app *TasteBuddyApp) GetRecipes(cached bool) ([]Recipe, error) {
	if cachedRecipes == nil || !cached || time.Now().Unix()-cachedRecipesAge > 3600 {
		app.Log("GetRecipes", "Get all recipes from database")
		var recipesFromDatabase = make([]Recipe, 0)
		// get all recipes from database that are not deleted
		if err := app.GetRecipesCollection().AllWithDefault(bson.M{"deleted": bson.M{"$ne": true}}, &recipesFromDatabase, []Recipe{}); err != nil {
			return []Recipe{}, app.LogError("GetRecipes.AllWithDefault", err)
		}
		cachedRecipes = recipesFromDatabase
		cachedRecipesAge = time.Now().Unix()
	} else {
		app.Log("GetRecipes", "Get all recipes from cache")
	}

	if len(cachedRecipes) == 0 {
		cachedRecipes = []Recipe{}
		return cachedRecipes, app.LogError("GetRecipes.GetItems", errors.New("no recipes found"))
	}

	return cachedRecipes, nil
}

// AddRecipes adds or updates recipes in database
// 1. Sort recipes into recipes with and without ids
// 2. Add recipes to database
func (app *TasteBuddyApp) AddRecipes(recipes []Recipe) error {

	// Prepare recipes
	var recipesWithIds []interface{}
	var recipesWithoutIds []interface{}

	// 1. Sort recipes into recipes with and without ids
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

	// 2. Add recipes to database
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

	return app.UpdateRecipeCache()
}

// DeleteRecipes deletes recipe by id from database
func (app *TasteBuddyApp) DeleteRecipes(recipeIds []string) error {

	// Delete recipe by setting "del" to true
	ctx := DefaultContext()
	for _, id := range recipeIds {
		if _, err := app.GetRecipesCollection().UpdateByID(ctx, id, bson.D{{Key: "$set", Value: bson.D{{Key: "del", Value: true}}}}); err != nil {
			app.Log("DeleteRecipes", "Delete recipe "+id+" from database")
			return app.LogError("DeleteRecipes.UpdateByID", err)
		}
	}

	return nil
}

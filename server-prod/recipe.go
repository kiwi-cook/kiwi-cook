/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"errors"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

type Recipe struct {
	ID          primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Name        LocalizedString    `json:"name,omitempty" bson:"name,omitempty"`
	Description LocalizedString    `json:"desc" bson:"desc,omitempty"`
	Items       []RecipeItem       `json:"items" bson:"items" binding:"required"`
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
		Copyright string `json:"cr,omitempty" bson:"cr,omitempty"`
		CookBook  struct {
			Name      string `json:"name,omitempty" bson:"name,omitempty"`
			Url       string `json:"url,omitempty" bson:"url,omitempty"`
			Publisher string `json:"pub,omitempty" bson:"pub,omitempty"`
		} `json:"cookBook,omitempty" bson:"cookBook,omitempty"`
	} `json:"src,omitempty" bson:"src,omitempty"`
	Deleted bool `json:"-" bson:"deleted,omitempty"`
}

type RecipeItem struct {
	ID       primitive.ObjectID `json:"id,omitempty" bson:"id,omitempty"`
	Quantity float64            `json:"quantity" bson:"quantity" binding:"required"`
	Unit     string             `json:"unit,omitempty" bson:"unit,omitempty" binding:"required"`
	Notes    LocalizedString    `json:"notes,omitempty" bson:"notes,omitempty"`
}

type Step struct {
	Description LocalizedString `json:"desc" bson:"desc" binding:"required"`
	ImgUrl      string          `json:"imgUrl,omitempty" bson:"imgUrl,omitempty"`
	Duration    int             `json:"duration,omitempty" bson:"duration,omitempty"`
	Temperature float32         `json:"temperature,omitempty" bson:"temperature,omitempty"`
}

// HandleGetRecipes gets called by server
// Calls getRecipesFromDB and handles the context
func (server *TasteBuddyServer) HandleGetRecipes(context *fiber.Ctx) error {
	recipes, err := server.GetRecipes(true)
	if err != nil {
		server.LogError("HandleGetRecipes.GetRecipes", err)
		return ErrorMessage(context, "Could not get recipes")
	}
	return Success(context, recipes)
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
		return cachedRecipes, app.LogError("GetRecipes", errors.New("no recipes found"))
	}

	return cachedRecipes, nil
}

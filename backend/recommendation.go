// Package src
/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type SuggestionRequest struct {
	Location Location `json:"location,omitempty"`
	Query    Query    `json:"query,omitempty"`
}

type Location struct {
	Latitude  float64 `json:"latitude,omitempty"`
	Longitude float64 `json:"longitude,omitempty"`
}

type Query struct {
	ItemQuery   []ItemQuery   `json:"item_query,omitempty"`
	RecipeQuery []RecipeQuery `json:"recipe_query,omitempty"`
}

type ItemQuery struct {
	ItemID  primitive.ObjectID `json:"id,omitempty"`
	Name    string             `json:"name,omitempty"`
	Exclude bool               `json:"exclude,omitempty"`
}

type RecipeQuery struct {
	RecipeID primitive.ObjectID `json:"id,omitempty"`
	Exclude  bool               `json:"exclude,omitempty"`
}

type SuggestionResponse struct {
	SuggestedRecipes []SuggestedRecipe `json:"suggested_recipes,omitempty"`
}

type SuggestedRecipe struct {
	RecipeID primitive.ObjectID `json:"recipe_id,omitempty"`
}

// HandleSuggestion gets called by router
// Calls suggestRecipes and handles the context
func (server *TasteBuddyServer) HandleSuggestion(context *gin.Context) {
	var suggestionRequest SuggestionRequest
	if err := context.ShouldBindJSON(&suggestionRequest); err != nil {
		server.LogError("HandleSuggestion", err)
		BadRequestError(context, "Invalid query")
		return
	}

	// suggest recipes
	result, err := server.SuggestRecipes(suggestionRequest)
	if err != nil {
		server.LogError("HandleSuggestion", err)
		ServerError(context, false)
		return
	}

	Success(context, result)
}

// SuggestRecipes suggests recipes based on the given query
func (app *TasteBuddyApp) SuggestRecipes(suggestionRequest SuggestionRequest) (SuggestionResponse, error) {
	var suggestionResponse SuggestionResponse

	var err error = nil

	checkItems := len(suggestionRequest.Query.ItemQuery) > 0

	if checkItems {
		// Search recipes by items
		recipesMap, err := app.SearchRecipesByItems(suggestionRequest.Query.ItemQuery)
		if err != nil {
			return suggestionResponse, err
		}

		// Convert map to slice
		var suggestedRecipe []SuggestedRecipe
		for _, recipe := range recipesMap {
			suggestedRecipe = append(suggestedRecipe, recipe)
		}

		suggestionResponse.SuggestedRecipes = suggestedRecipe
	}

	return suggestionResponse, err
}

func (app *TasteBuddyApp) SearchRecipesByItems(itemQuery []ItemQuery) (map[primitive.ObjectID]SuggestedRecipe, error) {
	// Get all recipes
	recipes, err := app.GetAllRecipes()
	if err != nil {
		return nil, err
	}

	// Create channel for recipes
	recipeChannel := make(chan *SuggestedRecipe)

	// Put all recipes into channel
	for _, recipe := range recipes {
		go func(recipe Recipe, itemQuery []ItemQuery) {
			// Check if recipe matches the query
			// If so, put it into the channel
			// If not, put nil into the channel
			recipeChannel <- recipe.MatchesByItems(itemQuery)
		}(recipe, itemQuery)
	}

	// Wait for all recipes to be found
	var recipesMap = make(map[primitive.ObjectID]SuggestedRecipe)
	for i := 0; i < len(recipes); i++ {
		recipe := <-recipeChannel
		// skip nil recipes
		if recipe == nil {
			continue
		}
		recipesMap[recipe.RecipeID] = *recipe
	}

	return recipesMap, nil
}

// MatchesByItems checks if the given recipe matches the given item query
func (recipe *Recipe) MatchesByItems(itemQuery []ItemQuery) *SuggestedRecipe {
	var suggestedRecipe *SuggestedRecipe = nil

	matchesAllItems := true
	fmt.Printf("List of items in recipe %s: %s\n", recipe.Name, recipe.GetItems())
	for _, item := range recipe.GetItems() {
		hasItem := false
		for _, query := range itemQuery {
			if item.ID == query.ItemID {
				hasItem = true
				if query.Exclude {
					matchesAllItems = false
				}
				break
			}
		}
		if !hasItem {
			matchesAllItems = false
		}
	}

	fmt.Printf("Recipe %s matches all items: %t\n", recipe.Name, matchesAllItems)

	// Create suggested recipe
	if matchesAllItems {
		suggestedRecipe = &SuggestedRecipe{
			RecipeID: recipe.ID,
		}
	}

	return suggestedRecipe
}

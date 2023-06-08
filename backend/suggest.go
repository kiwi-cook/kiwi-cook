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

type RecipeSuggestionQuery struct {
	ItemQuery []ItemQuery `json:"item_query,omitempty"`
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

// HandleRecipeSuggestions gets called by router
// Calls suggestRecipes and handles the context
func (server *TasteBuddyServer) HandleRecipeSuggestions(context *gin.Context) {
	var recipeSuggestionQuery RecipeSuggestionQuery
	if err := context.ShouldBindJSON(&recipeSuggestionQuery); err != nil {
		server.LogError("HandleSuggestion", err)
		BadRequestError(context, "Invalid query")
		return
	}

	// suggest recipes
	result, err := server.SuggestRecipes(recipeSuggestionQuery)
	if err != nil {
		server.LogError("HandleSuggestion", err)
		ServerError(context, false)
		return
	}

	Success(context, result)
}

// SuggestRecipes suggests recipes based on the given query
func (app *TasteBuddyApp) SuggestRecipes(recipeSuggestionQuery RecipeSuggestionQuery) ([]primitive.ObjectID, error) {

	var err error = nil
	// Search recipes by items
	recipesMap, err := app.SearchRecipesByItems(recipeSuggestionQuery.ItemQuery)
	if err != nil {
		return []primitive.ObjectID{}, err
	}

	// Convert map to slice
	var suggestedRecipes []primitive.ObjectID
	for _, recipe := range recipesMap {
		suggestedRecipes = append(suggestedRecipes, recipe)
	}

	if len(suggestedRecipes) == 0 {
		return []primitive.ObjectID{}, nil
	}

	return suggestedRecipes, err
}

func (app *TasteBuddyApp) SearchRecipesByItems(itemQuery []ItemQuery) (map[primitive.ObjectID]primitive.ObjectID, error) {
	// Get all recipes
	recipes, err := app.GetAllRecipes()
	if err != nil {
		return nil, err
	}

	// Check if there are any items
	if len(itemQuery) == 0 {
		return nil, nil
	}

	// Create channel for recipes
	recipeChannel := make(chan *primitive.ObjectID)

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
	var recipesMap = make(map[primitive.ObjectID]primitive.ObjectID)
	for i := 0; i < len(recipes); i++ {
		recipeID := <-recipeChannel
		// skip nil recipes
		if recipeID == nil {
			continue
		}
		recipesMap[*recipeID] = *recipeID
	}

	return recipesMap, nil
}

// MatchesByItems checks if the given recipe matches the given item query
func (recipe *Recipe) MatchesByItems(itemQuery []ItemQuery) *primitive.ObjectID {
	var suggestedRecipeID *primitive.ObjectID = nil

	matchesAllItems := true
	recipeItems := recipe.GetItems()
	if len(recipeItems) == 0 {
		return nil
	}

	for _, query := range itemQuery {
		hasItem := false
		for _, item := range recipeItems {
			if item.ID == query.ItemID {
				fmt.Printf("Recipe %s has item %s\n", recipe.Name, item.Name)
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

	// Create suggested recipe
	if matchesAllItems {
		suggestedRecipeID = &recipe.ID
	}

	return suggestedRecipeID
}

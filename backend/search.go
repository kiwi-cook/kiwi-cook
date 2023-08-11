// Package src
/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"math"
)

// ItemQuery is used to query items
type ItemQuery struct {
	ItemID  primitive.ObjectID `json:"id,omitempty"`
	Name    string             `json:"name,omitempty"`
	Exclude bool               `json:"exclude,omitempty"`
}

// RecipeQuery is used to query recipes
type RecipeQuery struct {
	RecipeID primitive.ObjectID `json:"id,omitempty"`
	Exclude  bool               `json:"exclude,omitempty"`
}

type RecipeSuggestionQuery struct {
	ItemQuery   []ItemQuery   `json:"item_query,omitempty"`
	RecipeQuery []RecipeQuery `json:"recipe_query,omitempty"`
	City        string        `json:"city,omitempty"`
}

type MatchedRecipe struct {
	RecipeID           primitive.ObjectID  `json:"recipe_id,omitempty"`
	MissingRecipeItems []MissingRecipeItem `json:"missing_items,omitempty"`
}

type RecipeSuggestion struct {
	RecipeID       primitive.ObjectID  `json:"recipe_id,omitempty"`
	RecipePrice    float64             `json:"recipe_price,omitempty"`
	MarketForPrice *Market             `json:"market_for_price,omitempty"`
	MissingItems   []MissingRecipeItem `json:"missing_items,omitempty"`
}

type MissingRecipeItem struct {
	ItemID primitive.ObjectID `json:"item_id,omitempty"`
	Amount float64            `json:"amount,omitempty"`
	Price  float64            `json:"price,omitempty"`
}

// HandleRecipeSuggestions gets called by server
// Calls suggestRecipes and handles the context
func (server *TasteBuddyServer) HandleRecipeSuggestions(context *gin.Context) {
	var recipeSuggestionQuery RecipeSuggestionQuery
	if err := context.ShouldBindJSON(&recipeSuggestionQuery); err != nil {
		server.LogError("HandleSuggestion", err)
		BadRequestError(context, "Invalid query")
		return
	}

	// Suggest recipes
	// result is a list of recipe ids
	result, err := server.SuggestRecipes(recipeSuggestionQuery)
	if err != nil {
		server.LogError("HandleSuggestion", err)
		ServerError(context, false)
		return
	}

	Success(context, result)
}

// SuggestRecipes suggests recipes based on the given query
// and returns a list of recipe ids
// @TODO Build a map of items mapped to recipes to improve performance
func (app *TasteBuddyApp) SuggestRecipes(recipeSuggestionQuery RecipeSuggestionQuery) ([]RecipeSuggestion, error) {
	// Get all recipes
	recipes, err := app.GetAllRecipes()
	if err != nil {
		return nil, err
	}

	// Check if there are any items
	itemQuery := recipeSuggestionQuery.ItemQuery
	if len(itemQuery) == 0 {
		return nil, nil
	}

	// Create channel for recipes to be put into
	// and put all recipes into it
	recipeChannel := make(chan *MatchedRecipe)
	for _, recipe := range recipes {
		go func(recipe Recipe, itemQuery []ItemQuery) {
			// Check if recipe matches the query
			// If so, put it into the channel
			// If not, put nil into the channel
			recipeChannel <- matchesByItems(recipe, itemQuery)
		}(recipe, itemQuery)
	}

	// Wait for all recipes to be found
	var matchedRecipesMap = make(map[primitive.ObjectID]MatchedRecipe)
	for range recipes {
		recipe := <-recipeChannel
		// skip nil recipes
		if recipe == nil {
			continue
		}
		matchedRecipesMap[recipe.RecipeID] = *recipe
	}

	var suggestedRecipes = make([]RecipeSuggestion, 0)
	for _, matchedRecipe := range matchedRecipesMap {
		recipe, err := app.GetRecipeById(matchedRecipe.RecipeID)
		if err != nil {
			continue
		}

		suggestedRecipe := RecipeSuggestion{
			RecipeID:     matchedRecipe.RecipeID,
			MissingItems: matchedRecipe.MissingRecipeItems,
		}

		// Calculate the price of the recipe
		if recipeSuggestionQuery.City != "" {
			if calculatedRecipePrice, market, err := app.CalculateLowestRecipePriceInCity(&recipe, recipeSuggestionQuery.City); err == nil {
				app.LogDebug("SuggestRecipes", "Market is "+market.MarketName)
				// Calculate the price of the missing items
				itemsMap := recipe.GetStepItemsMappedToId()
				for index, missingRecipeItem := range matchedRecipe.MissingRecipeItems {
					item := itemsMap[missingRecipeItem.ItemID]
					missingRecipeItem.Price, _ = app.CalculateItemPriceForMarket(&item.Item, *market)
					matchedRecipe.MissingRecipeItems[index] = missingRecipeItem
				}
				suggestedRecipe.RecipePrice = calculatedRecipePrice
				suggestedRecipe.MarketForPrice = market
			}
		}

		suggestedRecipes = append(suggestedRecipes, suggestedRecipe)
	}

	return suggestedRecipes, err
}

// CalculateLowestRecipePriceInCity calculates the lowest price of a recipe for a city
func (app *TasteBuddyApp) CalculateLowestRecipePriceInCity(recipe *Recipe, city string) (float64, *Market, error) {
	markets, err := app.GetMarketsByCity(city)
	if err != nil {
		app.LogError("CalculateRecipePriceInCity.GetMarketsByCity", err)
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

// matchesByItems checks if the given recipe matches the given item query
// and returns the recipe id if it does and the item ids of missing items
func matchesByItems(recipe Recipe, itemQuery []ItemQuery) *MatchedRecipe {
	var suggestedRecipeID primitive.ObjectID

	matchesAllItems := true
	recipeItemsMap := recipe.GetStepItemsMappedToId()
	if len(recipeItemsMap) == 0 {
		return nil
	}

	// Check if recipe matches the query
	for _, query := range itemQuery {
		hasItem := false
		for _, item := range recipeItemsMap {
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

	if !matchesAllItems {
		return nil
	}

	// Create suggested recipe
	var missingItems []MissingRecipeItem
	if matchesAllItems {
		suggestedRecipeID = recipe.ID

		// Get the items that were not in the query
		for _, recipeItem := range recipeItemsMap {
			hasItem := false
			for _, query := range itemQuery {
				if recipeItem.ID == query.ItemID {
					hasItem = true
					break
				}
			}
			if !hasItem {
				missingItems = append(missingItems, MissingRecipeItem{
					ItemID: recipeItem.ID,
					Amount: recipeItem.Amount,
				})
			}
		}
	}

	if suggestedRecipeID.IsZero() {
		return nil
	}

	var matchedRecipe = MatchedRecipe{
		RecipeID:           suggestedRecipeID,
		MissingRecipeItems: missingItems,
	}

	return &matchedRecipe
}

package main

import (
	"errors"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type RecipeQuery struct {
	RecipeID primitive.ObjectID `json:"id,omitempty"`
	UserID   primitive.ObjectID `json:"user,omitempty"`
	Name     string             `json:"name,omitempty"`
	/* Type     []struct {
		Exclude bool   `json:"exclude"`
		Type    string `json:"type"`
	} `json:"type,omitempty"` */
	Items []struct {
		ItemID  primitive.ObjectID `json:"id,omitempty"`
		Name    string             `json:"name,omitempty"`
		Exclude bool               `json:"exclude,omitempty"`
	} `json:"items,omitempty"`
}

type SearchQuery struct {
	Recipe []RecipeQuery `json:"recipe,omitempty"`
	Item   []struct {
		ItemID primitive.ObjectID `json:"id,omitempty"`
		Name   string             `json:"name,omitempty"`
		Type   string             `json:"type,omitempty"`
	} `json:"item,omitempty"`
}

type SearchResult struct {
	Recipe []Recipe `json:"recipe,omitempty"`
	Item   []Item   `json:"item,omitempty"`
}

// HandleSearch gets called by router
// Calls search and handles the context
func (app *TasteBuddyApp) HandleSearch(context *gin.Context) {

	var searchQuery SearchQuery
	if err := context.ShouldBindJSON(&searchQuery); err != nil {
		log.Print(err.Error())
		ServerError(context, true)
		return
	}

	result, err := search(searchQuery, app.client)
	if err != nil {
		ServerError(context, true)
		return
	}

	context.JSON(http.StatusOK, result)
}

// search searches for recipes and items by using goroutines
func search(searchQuery SearchQuery, client *TasteBuddyDatabase) (SearchResult, error) {
	var result SearchResult = SearchResult{}

	var err error = nil

	checkSearchRecipe := len(searchQuery.Recipe) > 0
	// searchItem := len(searchQuery.Item) > 0

	if checkSearchRecipe {
		// Search recipes

		recipeChannel := make(chan *Recipe)
		for _, recipeQuery := range searchQuery.Recipe {
			go func(recipeQuery RecipeQuery) {
				recipe, err := searchRecipe(recipeQuery, client)
				if err != nil {
					recipeChannel <- nil
				} else {
					recipeChannel <- &recipe
				}
			}(recipeQuery)
		}

		// Wait for all recipes to be found
		var recipesMap = make(map[primitive.ObjectID]Recipe)
		for i := 0; i < len(searchQuery.Recipe); i++ {
			recipe := <-recipeChannel
			if recipe == nil {
				continue
			}
			recipesMap[recipe.ID] = *recipe
		}

		// convert map to slice
		var recipes []Recipe
		for _, recipe := range recipesMap {
			recipes = append(recipes, recipe)
		}

		result.Recipe = recipes
	}

	return result, err
}

// searchRecipe searches for a recipe by ID or by different parameters
func searchRecipe(recipeQuery RecipeQuery, client *TasteBuddyDatabase) (Recipe, error) {
	var err error
	var recipe Recipe = Recipe{}

	// Check if recipe ID is given
	if recipeQuery.RecipeID != primitive.NilObjectID {
		log.Print("[searchRecipe] Search by ID ...")
		// Get recipe by ID
		recipe, err = client.GetRecipeById(recipeQuery.RecipeID)
	} else {
		// Get recipes by different parameters
		if recipeQuery.UserID != primitive.NilObjectID {
			// Get recipes by user ID

			log.Print("[searchRecipe] Search recipes of User ...")
			err = errors.New("not implemented")
			/*
				TODO: Implement this
				// Get recipes by user ID
				tmpRecipes, err := client.GetRecipesByUserId(recipe.UserID)
				if err != nil {
					result.Status = "error"
					return result, err
					} */
		} else {
			var allRecipes []Recipe
			// Get all recipes
			allRecipes, err = client.GetAllRecipes()
			if err != nil {
				return recipe, err
			}

			checkName := len(recipeQuery.Name) > 0
			checkItems := len(recipeQuery.Items) > 0

			// Get recipes by name
			log.Print("[searchRecipe] Search by Name=", checkName, " and Items=", checkItems, " ...")

			// Go through all recipes and ...
			for _, tmpRecipe := range allRecipes {

				// ... check if the name matches
				if checkName {
					if tmpRecipe.Name == recipeQuery.Name {
						recipe = tmpRecipe
						err = nil
					} else {
						log.Print("[searchRecipe] No match for recipe ", tmpRecipe.Name, " with nameQuery ", recipeQuery.Name)
						err = errors.New("no recipe found")
						continue
					}
				}

				// ... check if the items match
				if checkItems {
					matchesAllItems := true
					for _, itemQuery := range recipeQuery.Items {
						matchItem := false
						for _, item := range tmpRecipe.ExtractItems() {
							if item.ID == itemQuery.ItemID || item.Name == itemQuery.Name {
								matchItem = true
								break
							}
						}

						// matchItem | excludeItem
						// true      | true      -> false
						// true      | false     -> true
						// false     | true      -> true
						// false     | false     -> false
						if matchItem == itemQuery.Exclude {
							matchesAllItems = false
							break
						}
					}

					if matchesAllItems {
						recipe = tmpRecipe
						err = nil
					} else {
						log.Print("[searchRecipe] No match for recipe ", tmpRecipe.Name, " with itemQuery ", recipeQuery.Items)
						err = errors.New("no recipe found")
						continue
					}
				}

				break
			}
		}
	}

	return recipe, err
}

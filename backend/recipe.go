package main

import (
	"encoding/json"
	"io/ioutil"
	"strings"
)

type Recipe struct {
	RecipeID    int    `json:"id"`
	Name        string `json:"name"`
	Author      string `json:"author"`
	Description string `json:"description"`
	ImgUrl      string `json:"imgUrl"`
	Steps       []Step `json:"steps"`
}

type Step struct {
	Items       []StepItem `json:"items"`
	Description string     `json:"description"`
}

type StepItem struct {
	Amount int    `json:"amount"`
	Unit   string `json:"unit"`
	ItemID int    `json:"item"`
}

type Item struct {
	ItemID int    `json:"id"`
	Name   string `json:"name"`
	Type   string `json:"type"`
	ImgUrl string `json:"imgUrl"`
}

// Load items from file
var itemsFile, _ = ioutil.ReadFile(".data/items.json")
var items = []Item{}
var _ = json.Unmarshal([]byte(itemsFile), &items)

// Load recipes from file
var recipesFile, _ = ioutil.ReadFile(".data/recipes.json")
var recipes = []Recipe{}
var _ = json.Unmarshal([]byte(recipesFile), &recipes)

// AddRecipe adds a new recipe to the list of recipes
// and returns the list of recipes
func AddRecipe(newRecipe Recipe) []Recipe {
	newRecipe.RecipeID = len(recipes) + 1
	recipes = append(recipes, newRecipe)
	return recipes
}

// RecipesToString generates a string of the recipes list
func RecipesToString(recipes []Recipe) string {
	data, err := json.Marshal(recipes)
	if err == nil {
		return string(data)
	}
	return ""
}

// GetItemsByRecipes gets all items used in a recipe
func GetItemsByRecipe(recipe Recipe) []int {
	var items = []int{}

	for _, step := range recipe.Steps {
		for _, stepItem := range step.Items {
			items = append(items, stepItem.ItemID)
		}
	}
	return items
}

// ItemNameToItem maps a list of itemnames
// to a list of items
func ItemNameToItem(itemNames []string) []Item {
	var _items = []Item{}
	for _, itemName := range itemNames {
		var lowerItemName = strings.ToLower(itemName)
		for _, item := range items {
			if strings.ToLower(item.Name) == lowerItemName {
				_items = append(_items, item)
			}
		}
	}
	return _items
}

// ItemIdToItem maps a list of itemids
// to a list of items
func ItemIdToItem(itemIds []int) []Item {
	var _items = []Item{}
	for _, itemId := range itemIds {
		for _, item := range items {
			if item.ItemID == itemId {
				_items = append(_items, item)
			}
		}
	}
	return _items
}

// FindRecipeById returns the recipe with the given id
func FindRecipeById(recipeId int) Recipe {
	for _, recipe := range recipes {
		if recipe.RecipeID == recipeId {
			return recipe
		}
	}

	return recipes[0]
}

// FindRecipesByItems returns the recipes in which the
// given items are used
func FindRecipesByItems(items []Item) []Recipe {
	var filteredRecipes = []Recipe{}

	for _, item := range items {
		for _, recipe := range recipes {
			var itemsByRecipe = GetItemsByRecipe(recipe)
			for _, recipeItemID := range itemsByRecipe {
				if item.ItemID == recipeItemID {
					filteredRecipes = append(filteredRecipes, recipe)
				}
			}
		}
	}
	return filteredRecipes
}

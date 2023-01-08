package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Recipe struct {
	ID          string   `json:"_id,omitempty" bson:"_id,omitempty"`
	Name        string   `json:"name,omitempty" bson:"name,omitempty"`
	Author      string   `json:"author,omitempty" bson:"author,omitempty"`
	Description string   `json:"description,omitempty" bson:"description,omitempty"`
	ImgUrl      string   `json:"imgUrl,omitempty" bson:"imgUrl,omitempty"`
	Tags        []string `json:"tags,omitempty" bson:"tags,omitempty"`
	Steps       []Step   `json:"steps,omitempty" bson:"steps,omitempty"`
}

type Step struct {
	Items       []StepItem `json:"items" bson:"items"`
	Description string     `json:"description" bson:"description"`
}

type StepItem struct {
	Amount int    `json:"amount" bson:"amount"`
	Unit   string `json:"unit,omitempty" bson:"unit,omitempty"`
	ItemID string `json:"itemID" bson:"itemID"`
}

type Item struct {
	ID     string `json:"_id,omitempty" bson:"_id,omitempty"`
	Name   string `json:"name" bson:"name"`
	Type   string `json:"type" bson:"type"`
	ImgUrl string `json:"imgUrl,omitempty" bson:"imgUrl,omitempty"`
}

var recipes = []Recipe{}
var items = []Item{}

// Load items from file
func LoadItems() {
	itemsFile, _ := ioutil.ReadFile(".data/items.json")
	err := json.Unmarshal([]byte(itemsFile), &items)
	if err != nil {
		fmt.Println(err)
	}
}

// Load recipes from file
func LoadRecipes() {
	recipesFile, _ := ioutil.ReadFile(".data/recipes.json")
	err := json.Unmarshal([]byte(recipesFile), &recipes)
	if err != nil {
		fmt.Println(err)
	}
}

// Get recipes from database
func GetRecipesCollection(client *mongo.Client) *mongo.Collection {
	return client.Database("tastebuddy").Collection("recipes")
}

// Replaces all recipes
// Use the /m/editor to edit the recipes
func ReplaceRecipes(newRecipes []Recipe) {
	fmt.Println("Replace all recipes.")
	recipes = newRecipes
}

// Gets all recipes
func GetRecipesFromDB(client *mongo.Client) []Recipe {
	ctx := DefaultContext()
	cursor, err := GetRecipesCollection(client).Find(ctx, bson.M{})
	if err != nil {
		log.Fatal(err)
	}
	var recipesFromDatabase []Recipe
	if err = cursor.All(ctx, &recipesFromDatabase); err != nil {
		log.Fatal(err)
	}
	return recipesFromDatabase
}

// AddRecipeToDB adds a new recipe to the database of recipes
// and returns the list of recipes
func AddRecipeToDB(client *mongo.Client, newRecipe Recipe) []Recipe {
	ctx := DefaultContext()
	_, err := GetRecipesCollection(client).InsertOne(ctx, newRecipe)
	if err != nil {
		log.Fatal(err)
	}
	return GetRecipesFromDB(client)
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
func GetItemsByRecipe(recipe Recipe) []string {
	var items = []string{}

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
func ItemIdToItem(itemIds []string) []Item {
	var _items = []Item{}
	for _, itemId := range itemIds {
		for _, item := range items {
			if item.ID == itemId {
				_items = append(_items, item)
			}
		}
	}
	return _items
}

// FindRecipeById returns the recipe with the given id
func FindRecipeById(recipeId string) Recipe {
	for _, recipe := range recipes {
		if recipe.ID == recipeId {
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
				if item.ID == recipeItemID {
					filteredRecipes = append(filteredRecipes, recipe)
				}
			}
		}
	}
	return filteredRecipes
}

package main

import (
	"encoding/json"
)

type Recipe struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Autor       string `json:"autor"`
	Description string `json:"description"`
	Steps       []Step `json:"steps"`
}

type Step struct {
	Items       []Item `json:"items"`
	Description string `json:"description"`
}

type Item struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Type string `json:"type"`
}

var recipes = []Recipe{
	{
		ID:          1,
		Name:        "Pancakes",
		Description: "A delicious breakfast treat",
		Steps: []Step{
			{
				Items: []Item{
					{
						ID:   1,
						Name: "Flour",
						Type: "Ingredient",
					},
					{
						ID:   2,
						Name: "Eggs",
						Type: "Ingredient",
					},
					{
						ID:   3,
						Name: "Milk",
						Type: "Ingredient",
					},
					{
						ID:   4,
						Name: "Butter",
						Type: "Ingredient",
					},
					{
						ID:   5,
						Name: "Sugar",
						Type: "Ingredient",
					},
					{
						ID:   6,
						Name: "Mixer",
						Type: "Tool",
					},
				},
				Description: "Mix the flour, eggs, milk, butter and sugar together",
			},
			{
				Items: []Item{
					{
						ID:   7,
						Name: "Pancakes",
						Type: "Recipe",
					},
				},
				Description: "Enjoy your pancakes",
			},
		},
	},
}

func recipesToString(recipes []Recipe) string {
	data, err := json.Marshal(recipes)
	if err == nil {
		return string(data)
	}
	return ""
}

func GetItemsByRecipe(recipe Recipe) []Item {
	var items = []Item{}

	for _, step := range recipe.Steps {
		items = append(items, step.Items...)
	}
	return items
}

func FindRecipesByItems(items []Item) []Recipe {
	var filteredRecipes = []Recipe{}

	for _, recipe := range recipes {
		GetItemsByRecipe(recipe)
	}
	return filteredRecipes
}

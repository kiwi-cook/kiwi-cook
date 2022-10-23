package main

import (
	"encoding/json"
	"strings"
)

type Recipe struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Autor       string `json:"autor"`
	Description string `json:"description"`
	Steps       []Step `json:"steps"`
}

type Step struct {
	Items       []StepItem `json:"items"`
	Description string     `json:"description"`
}

type StepItem struct {
	Amount int    `json:"amount"`
	Unit   string `json:"unit"`
	Item   Item   `json:"item"`
}

type Item struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Type string `json:"type"`
}

var items = []Item{
	{
		ID:   1,
		Name: "Egg",
		Type: "Food",
	},
	{
		ID:   2,
		Name: "Flour",
		Type: "Food",
	},
	{
		ID:   3,
		Name: "Milk",
		Type: "Food",
	},
	{
		ID:   4,
		Name: "Salt",
		Type: "Food",
	},
	{
		ID:   5,
		Name: "Sugar",
		Type: "Food",
	},
	{
		ID:   6,
		Name: "Butter",
		Type: "Food",
	},
	{
		ID:   7,
		Name: "Baking Powder",
		Type: "Food",
	},
	{
		ID:   8,
		Name: "Baking Soda",
		Type: "Food",
	},
	{
		ID:   9,
		Name: "Vanilla Extract",
		Type: "Food",
	},
	{
		ID:   10,
		Name: "Chocolate Chips",
		Type: "Food",
	},
	{
		ID:   10000,
		Name: "Oven",
		Type: "Equipment",
	},
	{
		ID:   10001,
		Name: "Bowl",
		Type: "Equipment",
	},
	{
		ID:   10002,
		Name: "Spoon",
		Type: "Equipment",
	},
	{
		ID:   10003,
		Name: "Whisk",
		Type: "Equipment",
	},
	{
		ID:   10004,
		Name: "Fork",
		Type: "Equipment",
	},
	{
		ID:   10005,
		Name: "Baking Tray",
		Type: "Equipment",
	},
	{
		ID:   10006,
		Name: "Baking Sheet",
		Type: "Equipment",
	},
	{
		ID:   10007,
		Name: "Mixer",
		Type: "Equipment",
	},
	{
		ID:   10008,
		Name: "Spatula",
		Type: "Equipment",
	},
	{
		ID:   10009,
		Name: "Measuring Cup",
		Type: "Equipment",
	},
	{
		ID:   10010,
		Name: "Measuring Spoon",
		Type: "Equipment",
	},
	{
		ID:   10011,
		Name: "Knife",
		Type: "Equipment",
	},
	{
		ID:   10012,
		Name: "Grater",
		Type: "Equipment",
	},
	{
		ID:   10013,
		Name: "Sieve",
		Type: "Equipment",
	},
	{
		ID:   10014,
		Name: "Rolling Pin",
		Type: "Equipment",
	},
	{
		ID:   10015,
		Name: "Cookie Cutter",
		Type: "Equipment",
	},
	{
		ID:   10016,
		Name: "Pastry Brush",
		Type: "Equipment",
	},
	{
		ID:   10017,
		Name: "Cake Pan",
		Type: "Equipment",
	},
	{
		ID:   10018,
		Name: "Cake Tin",
		Type: "Equipment",
	},
	{
		ID:   10019,
		Name: "Cake Mold",
		Type: "Equipment",
	},
	{
		ID:   10020,
		Name: "Cake Ring",
		Type: "Equipment",
	},
}

var recipes = []Recipe{
	{
		ID:          1,
		Name:        "Pancakes",
		Description: "A delicious breakfast treat",
		Steps: []Step{
			{
				Description: "Mix the dry ingredients",
				Items: []StepItem{
					{
						Amount: 1,
						Unit:   "cup",
						Item:   items[1],
					},
					{
						Amount: 1,
						Unit:   "tsp",
						Item:   items[3],
					},
					{
						Amount: 1,
						Unit:   "tsp",
						Item:   items[4],
					},
					{
						Amount: 1,
						Unit:   "tsp",
						Item:   items[6],
					},
					{
						Amount: 1,
						Unit:   "tsp",
						Item:   items[7],
					},
					{
						Amount: 1,
						Unit:   "",
						Item:   items[17],
					},
				},
			},
			{
				Description: "Mix the wet ingredients",
				Items: []StepItem{
					{
						Amount: 1,
						Unit:   "cup",
						Item:   items[0],
					},
					{
						Amount: 1,
						Unit:   "cup",
						Item:   items[2],
					},
					{
						Amount: 1,
						Unit:   "",
						Item:   items[17],
					},
				},
			},
			{
				Description: "Mix the dry and wet ingredients",
				Items: []StepItem{
					{
						Amount: 1,
						Unit:   "tsp",
						Item:   items[8],
					},
					{
						Amount: 1,
						Unit:   "tsp",
						Item:   items[9],
					},
					{
						Amount: 1,
						Unit:   "",
						Item:   items[17],
					},
				},
			},
			{
				Description: "Cook the pancakes",
				Items: []StepItem{
					{
						Amount: 1,
						Unit:   "",
						Item:   items[10],
					},
				},
			},
		},
	},
	{
		ID:          2,
		Name:        "Chocolate Chip Cookies",
		Description: "A delicious dessert treat",
		Steps: []Step{
			{
				Description: "Mix the dry ingredients",
				Items: []StepItem{
					{
						Amount: 1,
						Unit:   "cup",
						Item:   items[1],
					},
					{
						Amount: 1,
						Unit:   "tsp",
						Item:   items[3],
					},
					{
						Amount: 1,
						Unit:   "tsp",
						Item:   items[4],
					},
					{
						Amount: 1,
						Unit:   "tsp",
						Item:   items[6],
					},
					{
						Amount: 1,
						Unit:   "tsp",
						Item:   items[7],
					},
					{
						Amount: 1,
						Unit:   "",
						Item:   items[17],
					},
				},
			},
			{
				Description: "Mix the wet ingredients",
				Items: []StepItem{
					{
						Amount: 1,
						Unit:   "cup",
						Item:   items[0],
					},
					{
						Amount: 1,
						Unit:   "cup",
						Item:   items[2],
					},
					{
						Amount: 1,
						Unit:   "",
						Item:   items[17],
					},
				},
			},
			{
				Description: "Mix the dry and wet ingredients",
				Items: []StepItem{
					{
						Amount: 1,
						Unit:   "",
						Item:   items[17],
					},
				},
			},
			{
				Description: "Cook the cookies",
				Items: []StepItem{
					{
						Amount: 1,
						Unit:   "",
						Item:   items[10],
					},
				},
			},
		},
	},
}

func RecipesToString(recipes []Recipe) string {
	data, err := json.Marshal(recipes)
	if err == nil {
		return string(data)
	}
	return ""
}

func GetItemsByRecipe(recipe Recipe) []Item {
	var items = []Item{}

	for _, step := range recipe.Steps {
		for _, stepItem := range step.Items {
			items = append(items, stepItem.Item)
		}
	}
	return items
}

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

func FindRecipesByItems(items []Item) []Recipe {
	var filteredRecipes = []Recipe{}

	for _, item := range items {
		for _, recipe := range recipes {
			var itemsByRecipe = GetItemsByRecipe(recipe)
			for _, recipeItem := range itemsByRecipe {
				if item.ID == recipeItem.ID {
					filteredRecipes = append(filteredRecipes, recipe)
				}
			}
		}
	}
	return filteredRecipes
}

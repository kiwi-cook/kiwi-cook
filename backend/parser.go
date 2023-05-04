// Package recipe
/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"encoding/json"
	"os"
	"time"
)

type RecipeParser func(string) ([]Recipe, error)

func (app *TasteBuddyApp) ParseRecipe(file string, parser string) {
	recipeParser := RecipeParser(nil)

	switch parser {
	case "cookstr":
		recipeParser = app.CookstrRecipeParser
	}

	if err := app.ParseAndSaveRecipe(file, recipeParser); err != nil {
		app.LogError("ParseRecipe", err)
		return
	}
}

func (app *TasteBuddyApp) CookstrRecipeParser(recipeFile string) ([]Recipe, error) {
	// read our opened jsonFile as a byte array.
	bytes, _ := os.ReadFile(recipeFile)

	type CookstrRecipe struct {
		Name        string   `json:"title"`
		Author      string   `json:"chef"`
		Description string   `json:"description"`
		Url         string   `json:"url"`
		ImgUrl      string   `json:"photo_url"`
		Date        string   `json:"date_modified"`
		Steps       []string `json:"instructions"`
	}
	var recipes []CookstrRecipe

	// we unmarshal our byteArray which contains our
	// jsonFile's content into 'users' which we defined above
	err := json.Unmarshal(bytes, &recipes)
	if err != nil {
		return []Recipe{}, app.LogError("CookstrRecipeParser", err)
	}

	// parse recipes
	var parsedRecipes []Recipe
	for _, recipe := range recipes {
		parsedRecipe := Recipe{}
		parsedRecipe.Name = recipe.Name
		parsedRecipe.Author = recipe.Author
		parsedRecipe.Description = recipe.Description
		parsedRecipe.Props.Url = recipe.Url
		parsedRecipe.Props.ImgUrl = recipe.ImgUrl
		parsedRecipe.Props.CreatedAt, err = time.Parse("2006–01–02", recipe.Date)
		if err != nil {
			return []Recipe{}, app.LogError("CookstrRecipeParser", err)
		}
		stepsDescriptions := recipe.Steps
		for _, description := range stepsDescriptions {
			parsedRecipe.Steps = append(parsedRecipe.Steps, StepFromDescription(description))
		}
		parsedRecipes = append(parsedRecipes, parsedRecipe)
	}

	return parsedRecipes, nil
}

// ParseAndSaveRecipe parses a recipe from an interface{} and adds it to the database
func (app *TasteBuddyApp) ParseAndSaveRecipe(file string, recipeParser RecipeParser) error {
	parsedRecipes, err := recipeParser(file)
	if err != nil {
		return app.LogError("ParseAndSaveRecipe", err)
	}

	// add recipe to database
	for _, parsedRecipe := range parsedRecipes {
		_, err := app.AddOrUpdateRecipe(parsedRecipe)
		if err != nil {
			return app.LogError("ParseAndSaveRecipe", err)
		}
	}

	return nil
}

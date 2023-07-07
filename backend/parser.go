// Package recipe
/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"encoding/json"
	"errors"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
	"os"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"
)

type RecipeParser func(string, chan Recipe)
type IngredientParser func(string) (error, StepItem)

func (app *TasteBuddyApp) ParseRecipe(file string, parser string) {
	app.Log("ParseRecipe", "Parsing recipe "+file)
	recipeParser := RecipeParser(nil)

	switch parser {
	case "cookstr":
		recipeParser = app.CookstrRecipeParser
	default:
		app.LogError("ParseRecipe", errors.New("invalid parser"))
		return
	}

	if err := app.ParseAndSaveRecipe(file, recipeParser); err != nil {
		app.LogError("ParseRecipe", err)
		return
	}
	app.Log("ParseRecipe", "Finished parsing recipe "+file)
}

func (app *TasteBuddyApp) CookstrRecipeParser(recipeFile string, recipeChannel chan Recipe) {
	app.LogTrace("CookstrRecipeParser", "Parsing recipe "+recipeFile)
	// Read the opened jsonFile as a byte array.
	bytes, _ := os.ReadFile(recipeFile)

	type CookstrRecipe struct {
		Name        string   `json:"title"`
		Author      string   `json:"chef"`
		Description string   `json:"description"`
		Url         string   `json:"url"`
		ImgUrl      string   `json:"photo_url"`
		Date        string   `json:"date_modified"`
		Steps       []string `json:"instructions"`
		Items       []string `json:"ingredients"`
		Type        string   `json:"type_of_dish"`
		Course      string   `json:"course"`
	}
	var recipes []CookstrRecipe

	// Parse json to struct
	err := json.Unmarshal(bytes, &recipes)
	if err != nil {
		return
	}
	recipes = recipes[:100]

	// Pre-cache all items
	app.GetAllItems(false)

	// Create a wait group
	var waitGroup sync.WaitGroup
	waitGroup.Add(len(recipes))

	// Close the recipe channel when all recipes are parsed
	go func() {
		waitGroup.Wait()
		close(recipeChannel)
	}()

	// Parse recipes
	for _, recipe := range recipes {
		go func(recipe CookstrRecipe) {
			// Defer the wait group
			defer waitGroup.Done()

			parsedRecipe := Recipe{}
			parsedRecipe.Name = recipe.Name
			app.Log("CookstrRecipeParser", "Parsing recipe "+recipe.Name)
			parsedRecipe.Author = recipe.Author
			parsedRecipe.Description = recipe.Description
			parsedRecipe.Props.Url = recipe.Url
			parsedRecipe.Props.ImgUrl = recipe.ImgUrl
			if parsedRecipe.Props.CreatedAt, err = time.Parse("2006-01-02", recipe.Date); err != nil {
				app.LogError("CookstrRecipeParser", err)
				return
			}
			stepItems := app.ParseItems(recipe.Items, CookstrIngredientParser)
			stepsDescriptions := recipe.Steps
			for _, description := range stepsDescriptions {
				parsedRecipe.Steps = append(parsedRecipe.Steps, app.StepFromDescription(description, stepItems))
			}
			app.Log("CookstrRecipeParser", "Finished parsing recipe "+recipe.Name)
			recipeChannel <- parsedRecipe
		}(recipe)
	}
	app.LogTrace("CookstrRecipeParser", "Finished parsing recipes")
}

func (app *TasteBuddyApp) StepFromDescription(description string, stepItems []StepItem) Step {
	app.LogTrace("StepFromDescription", "Parsing step from description "+description)

	step := Step{}
	descriptionTokens := strings.Fields(description)
	// Make map of step items
	var stepItemsInDescription = make(map[string]StepItem)
	for _, token := range descriptionTokens {
		similarResult := app.MatchOrNewItem(token, 0.9)
		if similarResult.error != nil {
			app.LogError("StepFromDescription[MatchOrNewItem]", similarResult.error)
			continue
		}

		matchResult := app.MatchItemToStepItem(similarResult.Item, stepItems, 0.5)
		if matchResult.error != nil {
			app.LogError("StepFromDescription[MatchItemToStepItem]", matchResult.error)
			continue
		}

		if matchResult.success {
			stepItemsInDescription[matchResult.Item.Name] = matchResult.StepItem
		}
	}
	step.Description = description
	for _, stepItem := range stepItemsInDescription {
		step.Items = append(step.Items, stepItem)
	}
	step.Duration = 0
	step.ImgUrl = ""
	step.AdditionalStepInformation = nil

	app.LogTrace("StepFromDescription", "Finished parsing step from description "+description)
	return step
}

func (app *TasteBuddyApp) ParseItems(items []string, parser IngredientParser) []StepItem {
	app.LogTrace("ParseItems", "Parsing items")

	var stepItems []StepItem
	var err error

	for _, ingredient := range items {
		stepItem := StepItem{}

		// parse ingredient
		if err, stepItem = parser(ingredient); err != nil {
			continue
		}
		stepItem.Type = "ingredient"

		stepItems = append(stepItems, stepItem)
	}

	app.LogTrace("ParseItems", "Finished parsing items")
	app.LogDebug("ParseItems", "Parsed ", stepItems)

	return stepItems
}

func CookstrIngredientParser(ingredientStr string) (error, StepItem) {
	// Regex pattern to match amount and unit
	re := regexp.MustCompile(`^(?P<amount>([\d/.½¼¾\-]|(\s*to\s*))+)\s*(?P<unit>(tablespoons?|teaspoons?|cups?|ounces?|kg|(kilo)?gr(ams)?|ml|(milli)?l(itres)?)?)\s+(?P<ingredient>.*)$`)

	match := re.FindStringSubmatch(ingredientStr)
	if match == nil {
		return errors.New("invalid ingredient"), StepItem{}
	}
	names := re.SubexpNames()

	result := make(map[string]string)
	for i, name := range names {
		if i != 0 && name != "" {
			result[name] = match[i]
		}
	}

	amount := ParseAmount(result["amount"])
	unit := ParseUnit(result["unit"])
	ingredient := cases.Title(language.English, cases.Compact).String(result["ingredient"])

	stepItem := StepItem{
		Amount: amount,
		Unit:   unit,
		Item: Item{
			Name: ingredient,
		},
	}

	return nil, stepItem
}

// ParseAmount converts a string amount to a float64
func ParseAmount(amount string) float64 {
	var errorAmount = 0.0
	re := regexp.MustCompile(`((?P<comFraction>(?P<factor>\d*)(?P<fraction>[½¼¾⅓⅔⅛⅜]))|(?P<number>[\d\.]+))`)
	match := re.FindStringSubmatch(amount)
	if match == nil {
		return errorAmount
	}

	names := re.SubexpNames()
	result := make(map[string]string)
	for i, name := range names {
		if i != 0 && name != "" {
			result[name] = match[i]
		}
	}

	var err error
	var amountFloat = errorAmount
	if result["number"] != "" {
		if amountFloat, err = strconv.ParseFloat(result["number"], 64); err != nil {
			return errorAmount
		}
	} else if result["comFraction"] != "" {
		switch result["fraction"] {
		case "½":
			amountFloat = 0.5
		case "¼":
			amountFloat = 0.25
		case "¾":
			amountFloat = 0.75
		case "⅓":
			amountFloat = 0.33
		case "⅔":
			amountFloat = 0.66
		case "⅛":
			amountFloat = 0.125
		}

		if result["factor"] != "" {
			var factor int
			if factor, err = strconv.Atoi(result["factor"]); err != nil {
				return amountFloat
			}
			amountFloat = amountFloat * float64(factor)
		}
	}

	return amountFloat
}

// ParseUnit parses a unit string and returns a standard unit
func ParseUnit(unit string) string {
	switch unit {
	case "tablespoon":
		return "tbsp"
	case "tablespoons":
		return "tbsp"
	case "teaspoon":
		return "tsp"
	case "teaspoons":
		return "tsp"
	case "cup":
		return "cup"
	case "cups":
		return "cup"
	case "ounce":
		return "oz"
	case "ounces":
		return "oz"
	case "kg":
		return "kg"
	case "kilo":
		return "kg"
	case "kilogram":
		return "kg"
	case "kilograms":
		return "kg"
	case "gr":
		return "g"
	case "gram":
		return "g"
	case "grams":
		return "g"
	case "ml":
		return "ml"
	case "milliliter":
		return "ml"
	case "milliliters":
		return "ml"
	case "l":
		return "l"
	case "liter":
		return "l"
	case "liters":
		return "l"
	default:
		return unit
	}
}

// ParseAndSaveRecipe parses a recipe from an interface{} and adds it to the database
func (app *TasteBuddyApp) ParseAndSaveRecipe(file string, recipeParser RecipeParser) error {

	// Create channel for recipes
	var recipes []Recipe
	recipeChannel := make(chan Recipe)
	recipeParser(file, recipeChannel)

	// Receive recipes from channel
	for recipe := range recipeChannel {
		app.LogDebug("ParseAndSaveRecipe", "Received recipe: ", recipe)
		recipes = append(recipes, recipe)
	}

	// Save items to database
	var items []Item
	for _, recipe := range recipes {
		items = append(items, recipe.GetItems()...)
	}
	if err := app.AddOrUpdateItems(items); err != nil {
		return app.LogError("ParseAndSaveRecipe", errors.New("error saving items to database: "+err.Error()))
	}

	// Save recipes to database
	if err := app.AddOrUpdateRecipes(recipes); err != nil {
		return app.LogError("ParseAndSaveRecipe", errors.New("error saving recipes to database: "+err.Error()))
	}

	return nil
}

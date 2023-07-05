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
	"time"
)

type RecipeParser func(string) ([]Recipe, error)
type IngredientParser func(string) (StepItem, error)

func (app *TasteBuddyApp) ParseRecipe(file string, parser string) {
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
		Items       []string `json:"ingredients"`
		Type        string   `json:"type_of_dish"`
		Course      string   `json:"course"`
	}
	var recipes []CookstrRecipe

	// we unmarshal our byteArray which contains our
	// jsonFile's content into 'users' which we defined above
	err := json.Unmarshal(bytes, &recipes)
	if err != nil {
		return []Recipe{}, app.LogError("CookstrRecipeParser", err)
	}
	// recipes = recipes[0:1]

	// parse recipes
	var parsedRecipes []Recipe
	for _, recipe := range recipes {
		parsedRecipe := Recipe{}
		parsedRecipe.Name = recipe.Name
		parsedRecipe.Author = recipe.Author
		parsedRecipe.Description = recipe.Description
		parsedRecipe.Props.Url = recipe.Url
		parsedRecipe.Props.ImgUrl = recipe.ImgUrl
		parsedRecipe.Props.CreatedAt, err = time.Parse("2006-01-02", recipe.Date)
		if err != nil {
			return []Recipe{}, app.LogError("CookstrRecipeParser", err)
		}
		stepsDescriptions := recipe.Steps
		stepItems := ParseItems(recipe.Items, CookstrIngredientParser)
		app.AddOrUpdateStepItems(stepItems)
		for _, description := range stepsDescriptions {
			parsedRecipe.Steps = append(parsedRecipe.Steps, app.StepFromDescription(description, stepItems))
		}
		parsedRecipes = append(parsedRecipes, parsedRecipe)
	}

	return parsedRecipes, nil
}

func (app *TasteBuddyApp) StepFromDescription(description string, stepItems []StepItem) Step {
	step := Step{}
	descriptionTokens := strings.Fields(description)
	var stepItemsInDescription []StepItem
	for _, token := range descriptionTokens {
		if item, err := app.GetMostSimilarItem(token); err != nil {
			continue
		} else {
			if stepItem, err := app.MatchItemToStepItem(item, stepItems); err != nil {
				continue
			} else {
				stepItemsInDescription = append(stepItemsInDescription, stepItem)
			}
		}
	}
	step.Items = stepItemsInDescription
	step.Duration = 0
	step.ImgUrl = ""
	step.AdditionalStepInformation = nil

	return step
}

func ParseItems(items []string, parser IngredientParser) []StepItem {
	var stepItems []StepItem

	for _, ingredient := range items {
		stepItem := StepItem{}

		// parse ingredient
		stepItem, err := parser(ingredient)
		if err != nil {
			continue
		}
		stepItem.Type = "ingredient"

		stepItems = append(stepItems, stepItem)
	}

	return stepItems
}

func CookstrIngredientParser(ingredientStr string) (StepItem, error) {
	// Regex pattern to match amount and unit
	re := regexp.MustCompile(`^(?P<amount>([\d/.½¼¾\-]|(\s*to\s*))+)\s*(?P<unit>(tablespoons?|teaspoons?|cups?|ounces?|kg|(kilo)?gr(ams)?|ml|(milli)?l(itres)?)?)\s+(?P<ingredient>.*)$`)

	match := re.FindStringSubmatch(ingredientStr)
	if match == nil {
		return StepItem{}, errors.New("invalid ingredient")
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

	return stepItem, nil
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
	parsedRecipes, err := recipeParser(file)
	if err != nil {
		return app.LogError("ParseAndSaveRecipe", err)
	}

	// add recipe to database
	for _, parsedRecipe := range parsedRecipes {
		app.LogDebug("ParseAndSaveRecipe", "Adding recipe: "+parsedRecipe.Name)
		app.LogDebug("ParseAndSaveRecipe", "Recipe: %+v", parsedRecipe)
		_, _, err := app.AddOrUpdateRecipe(parsedRecipe)
		if err != nil {
			return app.LogError("ParseAndSaveRecipe", err)
		}
	}

	return nil
}

// Package recipe
// Deprecated
/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/adrg/strutil"
	"github.com/adrg/strutil/metrics"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
	"os"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"
)

type RecipeParser func(string, chan Recipe) error
type ItemParser func(string, chan Item) error
type IngredientParser func(string) (StepItem, error)
type StepItemResult struct {
	StepItem
	error   error
	success bool `json:"success"`
}

// Parse parses a file and saves the content to the database
func (app *TasteBuddyApp) Parse(file string, parser string) {
	app.Log("Parse", "Parsing "+file)
	recipeParser := RecipeParser(nil)
	itemParser := ItemParser(nil)

	switch parser {
	case "cookstr":
		recipeParser = app.CookstrRecipeParser
	case "static_items":
		itemParser = app.StaticItemParser
	default:
		app.LogError("Parse", errors.New("invalid parser"))
		return
	}

	var err error
	if itemParser != nil {
		err = app.ParseAndSaveItems(file, itemParser)
	}
	if recipeParser != nil {
		err = app.ParseAndSaveRecipe(file, recipeParser)
	}
	if err != nil {
		app.LogError("Parse", err)
	}
	app.Log("Parse", "Finished parsing "+file)
}

// ParseAndSaveRecipe parses a recipe file and saves it to the database
func (app *TasteBuddyApp) ParseAndSaveRecipe(file string, recipeParser RecipeParser) error {
	var err error

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
	if _, err = app.AddOrUpdateItems(items); err != nil {
		return app.LogError("ParseAndSaveRecipe.AddOrUpdateItems", errors.New("error saving items to database: "+err.Error()))
	}

	// Save recipes to database
	itemsMap, err := app.GetAllItems(false)
	if err != nil {
		return app.LogError("ParseAndSaveRecipe.GetAllItems", errors.New("error getting items from database: "+err.Error()))
	}
	recipes = AddItemIdsToRecipes(recipes, itemsMap)
	if err = app.AddRecipes(recipes); err != nil {
		return app.LogError("ParseAndSaveRecipe.AddRecipes", errors.New("error saving recipes to database: "+err.Error()))
	}

	return err
}

func (app *TasteBuddyApp) CookstrRecipeParser(recipeFile string, recipeChannel chan Recipe) error {
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
		return app.LogError("CookstrRecipeParser", errors.New("error parsing json: "+err.Error()))
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
			parsedRecipe.Authors = []string{recipe.Author}
			parsedRecipe.Description = recipe.Description
			parsedRecipe.Props.Url = recipe.Url
			parsedRecipe.Props.ImgUrl = recipe.ImgUrl
			if parsedRecipe.Props.CreatedAt, err = time.Parse("2006-01-02", recipe.Date); err != nil {
				app.LogError("CookstrRecipeParser", err)
				return
			}
			stepItems := parseItems(recipe.Items, CookstrIngredientParser)
			stepsDescriptions := recipe.Steps
			for _, description := range stepsDescriptions {
				parsedRecipe.Steps = append(parsedRecipe.Steps, app.StepFromDescription(description, stepItems))
			}
			app.Log("CookstrRecipeParser", "Finished parsing recipe "+recipe.Name)
			recipeChannel <- parsedRecipe
		}(recipe)
	}
	app.LogTrace("CookstrRecipeParser", "Finished parsing recipes")
	return nil
}

// StepFromDescription parses step from description
func (app *TasteBuddyApp) StepFromDescription(description string, stepItems []StepItem) Step {
	app.LogTrace("StepFromDescription", "Parsing step from description "+description)

	step := Step{}
	descriptionTokens := strings.Fields(description)
	// Make map of step items
	var stepItemsInDescription = make(map[string]StepItem)
	for _, token := range descriptionTokens {
		similarResult := app.MatchOrNewItem(token, 0.9)
		if similarResult.error != nil {
			app.LogError("StepFromDescription.MatchOrNewItem", similarResult.error)
			continue
		}

		matchResult := app.MatchItemToStepItem(similarResult.Item, stepItems, 0.5)
		if matchResult.error != nil {
			app.LogError("StepFromDescription.MatchItemToStepItem", matchResult.error)
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

	app.LogTrace("StepFromDescription", "Finished parsing step from description "+description)
	return step
}

// MatchItemToStepItem selects the most similar item from the given step items
func (app *TasteBuddyApp) MatchItemToStepItem(item Item, stepItems []StepItem, threshold float64) StepItemResult {
	var mostSimilarItem StepItem
	var mostSimilarity float64 = 0
	for _, stepItem := range stepItems {
		if similarity := strutil.Similarity(item.Name, stepItem.Name, metrics.NewHamming()); similarity >= threshold && similarity > mostSimilarity {
			app.LogDebug("MatchItemToStepItem.Similarity", "Found most similar step item "+stepItem.Name+" to "+item.Name+" with similarity "+fmt.Sprintf("%f", similarity))
			mostSimilarItem = stepItem
			mostSimilarity = similarity
		}
	}

	if mostSimilarity == 0 {
		app.LogDebug("MatchItemToStepItem", "No similar step item found for "+item.Name)
		return StepItemResult{StepItem: StepItem{}, success: false}
	}

	return StepItemResult{StepItem: mostSimilarItem, success: true}
}

func CookstrIngredientParser(ingredientStr string) (StepItem, error) {
	// Regex pattern to match amount and unit
	re := regexp.MustCompile(`^(?P<amount>([\d.½¼¾\-]|(\s*to\s*))+)\s*(?P<unit>(tablespoons?|teaspoons?|cups?|ounces?|kg|(kilo)?gr(ams)?|ml|(milli)?l(itres)?)?)\s+(?P<ingredient>.*)$`)

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

	amount := parseAmount(result["amount"])
	unit := parseUnit(result["unit"])
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

func parseItems(items []string, parser IngredientParser) []StepItem {
	var stepItems []StepItem
	var err error

	for _, ingredient := range items {
		stepItem := StepItem{}

		// parse ingredient
		if stepItem, err = parser(ingredient); err != nil {
			continue
		}
		stepItem.Type = "ingredient"

		stepItems = append(stepItems, stepItem)
	}

	return stepItems
}

// parseAmount converts a string amount to a float64
func parseAmount(amount string) float64 {
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

// parseUnit parses a unit string and returns a standard unit
func parseUnit(unit string) string {
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

// ParseAndSaveItems parses a file and saves the items to the database
func (app *TasteBuddyApp) ParseAndSaveItems(file string, itemParser ItemParser) error {
	var err error

	// Create channel for recipes
	itemChannel := make(chan Item)
	itemParser(file, itemChannel)

	// Receive recipes from channel
	var items []Item
	for item := range itemChannel {
		items = append(items, item)
	}

	// Add or update items in database
	if _, err = app.AddOrUpdateItems(items); err != nil {
		return app.LogError("ParseAndSaveRecipe", errors.New("error saving items to database: "+err.Error()))
	}

	return err
}

// StaticItemParser parses a json item file and sends the items to the item channel
func (app *TasteBuddyApp) StaticItemParser(itemFile string, itemChannel chan Item) error {
	app.LogTrace("StaticItemParser", "Parsing item "+itemFile)
	// Read the opened jsonFile as a byte array.
	bytes, _ := os.ReadFile(itemFile)

	type StaticItem struct {
		Name   string `json:"name"`
		ImgUrl string `json:"img_url,omitempty"`
		Type   string `json:"type"`
	}
	var items []StaticItem

	// Parse json to struct
	err := json.Unmarshal(bytes, &items)
	if err != nil {
		return app.LogError("StaticItemParser", errors.New("error parsing json: "+err.Error()))
	}

	// Pre-cache all items
	app.GetAllItems(false)

	// Create a wait group
	var waitGroup sync.WaitGroup
	waitGroup.Add(len(items))

	// Close the item channel when all items are parsed
	go func() {
		waitGroup.Wait()
		close(itemChannel)
	}()

	// Parse items
	for _, item := range items {
		go func(item StaticItem) {
			// Defer the wait group
			defer waitGroup.Done()

			parsedItem := Item{}
			parsedItem.Name = item.Name
			parsedItem.Type = item.Type
			parsedItem.ImgUrl = item.ImgUrl
			itemChannel <- parsedItem
		}(item)
	}
	app.LogTrace("StaticItemParser", "Finished parsing item "+itemFile)
	return nil
}

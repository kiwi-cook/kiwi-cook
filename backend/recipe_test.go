/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import "testing"

func TestAddRecipe(t *testing.T) {
	app := TasteBuddyAppFactory()
	app.SetLogger(string(DefaultLogLevel))
	app.Default()

	recipe := Recipe{
		Name: "Chocolate Chip Cookies",
	}

	recipeId, _, err := app.AddOrUpdateRecipe(recipe)
	if err != nil {
		t.Errorf("Error adding recipe: %v", err)
	}

	retrievedRecipe, err := app.GetRecipeById(recipeId)
	if err != nil {
		t.Errorf("Error getting recipe: %v", err)
	}

	if retrievedRecipe.Name != recipe.Name {
		t.Errorf("Recipe name does not match. Expected %s, got %s", recipe.Name, retrievedRecipe.Name)
	}
}

func TestAddAndDeleteRecipes(t *testing.T) {
	app := TasteBuddyAppFactory()
	app.SetLogger(string(DefaultLogLevel))
	app.Default()

	recipes := []Recipe{
		{Name: "Chocolate Chip Cookies"},
		{Name: "Apple Pie"},
		{Name: "Pizza"},
	}

	for _, recipe := range recipes {
		recipeIdAdded, _, err := app.AddOrUpdateRecipe(recipe)
		if err != nil {
			t.Errorf("Error adding recipe: %v", err)
		}
		recipeIdDeleted, err := app.DeleteRecipeById(recipeIdAdded)
		if err != nil {
			t.Errorf("Error deleting recipe: %v", err)
		}

		if recipeIdAdded != recipeIdDeleted {
			t.Errorf("Recipe id does not match. Expected %d, got %d", recipeIdAdded, recipeIdDeleted)
		}
	}
}

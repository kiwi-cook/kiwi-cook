from rapidfuzz import fuzz

from lib.database.mongodb import get_database
from models.recipe import Recipe


def map_recipe(user_items: list[str], recipe: Recipe):
    ingredients = recipe.ingredients
    matched_ingredients = [
        ingredient
        for ingredient in ingredients
        if any(
            fuzz.token_set_ratio(
                ingredient.ingredient.name.get_first(),
                item.lower(),
                70,
            )
            for item in user_items
        )
    ]
    return {
        "recipe": recipe,
        "matchedIngredients": matched_ingredients,
        "matchRatio": (
            len(matched_ingredients) / len(ingredients) if ingredients else 0.0
        ),
    }


def generate_weekplan(user_items: list[str]):
    read_client = get_database()
    recipes: list[Recipe] = list(read_client["recipes"]["recipes"].find())

    sorted_recipes = sorted(
        (map_recipe(user_items, recipe) for recipe in recipes),
        key=lambda x: x["matchRatio"],
        reverse=True,
    )

    selected_recipes = []
    used_ingredients = set()

    for recipe_map in sorted_recipes:
        recipe = recipe_map["recipe"]
        matched_ingredients = recipe_map["matchedIngredients"]

        if any(
            not any(
                fuzz.token_set_ratio(
                    ingredient.ingredient.name.get_first().lower(),
                    used.lower().split(),
                    70,
                )
                for used in used_ingredients
            )
            for ingredient in matched_ingredients
        ):
            selected_recipes.append(recipe)
            used_ingredients.update(
                ingredient.ingredient.name.get_first().lower()
                for ingredient in matched_ingredients
            )

        # Optional: Stop if we've used all available ingredients
        if len(used_ingredients) == len(set(user_items)):
            break

    return selected_recipes


# Test the code

generate_weekplan(["salt"])

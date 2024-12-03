import json
import re
from datetime import datetime
from difflib import SequenceMatcher
from typing import List, Union, Tuple

from bson import encode
from ingredient_parser import parse_ingredient
from ingredient_parser.dataclasses import ParsedIngredient

from lib.parse import extract_temperature, extract_durations
from lib.pipeline.recipe.pipeline import PipelineElement
from lib.utils import parse_iso8601_duration
from models.recipe import (
    Recipe,
    MultiLanguageField,
    RecipeStep,
    RecipeIngredient, Ingredient, Nutrition,
)


class ParseRecipeAllRecipes(PipelineElement):
    def __init__(self, mongo_client):
        super().__init__("ParseRecipeAllRecipes")
        self.mongo_client = mongo_client

    async def process_task(self, allrecipes_json: str):
        recipe = self.map_allrecipes(allrecipes_json)
        if recipe is None:
            self.logger.info(f"Could not map the recipe from JSON: {allrecipes_json}")
            return None

        # Convert Pydantic model to dictionary
        recipe_dict = recipe.model_dump(
            by_alias=True, exclude_none=True, exclude_unset=True, mode="json"
        )
        # Encode the document to BSON to check if there are any issues
        encoded_document = encode(recipe_dict)
        self.mongo_client["recipes"]["recipes"].update_one(
            {"name": recipe.name[recipe.lang]},
            {"$set": recipe_dict},
            upsert=True,
        )
        return recipe

    def map_allrecipes(self, allrecipes_json: str):
        """
        Parses a recipe from a given JSON string.

        Args:
            allrecipes_json: JSON content of the recipe.
        """
        data = json.loads(allrecipes_json)

        # Extracting the relevant fields from the JSON
        lang = "en-US"  # Assuming language is always English as per the example JSON
        name = MultiLanguageField.new(lang, data.get("title"))
        description = MultiLanguageField.new(lang, data.get("description"))
        servings = int(data["nutritional_information"].get("servings", 1))  # Fallback to 1 if not present

        # Ingredients are already in list form in the JSON
        ingredients = self.parse_ingredients(data["ingredients"], lang=lang, recipe_servings=servings)

        # Parsing steps from JSON
        steps = []
        for step_data in data["steps"]:
            step = RecipeStep(
                description=MultiLanguageField.new(lang, step_data["instruction"])
            )
            steps.append(step)

        # Parsing duration
        prep_time: int = parse_iso8601_duration(data.get("prep_time", 0))  # Default to "0" if not available
        cook_time: int = parse_iso8601_duration(data.get("cook_time", 0))
        total_time: int = parse_iso8601_duration(data.get("total_time", 0))  # Example: PT4Days20H40M
        duration = total_time if total_time else prep_time + cook_time

        tags = data.get("categories", [])  # Categories can be treated as tags

        # Nutrition information
        calories = data.get("calories", 0)
        total_fat = data.get("total_fat", 0)
        saturated_fat = data.get("saturated_fat", 0)
        cholesterol = data.get("cholesterol", 0)
        sodium = data.get("sodium", 0)
        potassium = data.get("potassium", 0)
        total_carbohydrates = data.get("total_carbohydrate", 0)
        dietary_fiber = data.get("dietary_fiber", 0)
        protein = data.get("protein", 0)
        sugars = data.get("sugars", 0)
        vitamin_a = data.get("vitamin_a", 0)
        vitamin_c = data.get("vitamin_c", 0)
        calcium = data.get("calcium", 0)
        iron = data.get("iron", 0)
        thiamin = data.get("thiamin", 0)
        niacin = data.get("niacin", 0)
        vitamin_b6 = data.get("vitamin_b6", 0)
        magnesium = data.get("magnesium", 0)
        folate = data.get("folate", 0)

        nutrition = Nutrition(
            calories=calories,
            protein=protein,
            carbs=total_carbohydrates,
            fat=total_fat,
            fiber=dietary_fiber,
        )

        # Return the parsed Recipe object
        return Recipe(
            name=name,
            lang=lang,
            description=description,
            ingredients=ingredients,
            steps=steps,
            duration=duration,
            props={"tags": tags},
            servings=servings,
            deleted=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            cuisine=None,
            difficulty="medium",
            nutrition=nutrition,
            video_url=None,
        )

    def parse_ingredients(
            self, ingredients: Union[str, List[str]], lang: str = "en-US", recipe_servings=1
    ) -> List[RecipeIngredient]:
        if isinstance(ingredients, str):
            ingredients = [ingredients]

        return [
            self._process_single_ingredient(
                ingredient, lang=lang, recipe_servings=recipe_servings
            )
            for ingredient in ingredients
        ]

    def _process_single_ingredient(
            self, ingredient_name: str, lang: str = "en-US", recipe_servings=1
    ) -> RecipeIngredient | None:
        parsed_ingredient = parse_ingredient(ingredient_name)
        if not parsed_ingredient:
            return None

        # Get the ingredient name
        ingredient_name = (
            parsed_ingredient.name.text if parsed_ingredient.name else None
        )
        ingredient_text = (
            parsed_ingredient.comment.text if parsed_ingredient.comment else None
        )

        # If the ingredient name is not found, use the text
        ingredient_name = ingredient_name if ingredient_name else ingredient_text

        ingredient = self._get_or_create_ingredient(
            ingredient_name=ingredient_name, lang=lang
        )
        return self._create_recipe_ingredient(
            ingredient, parsed_ingredient, recipe_servings=recipe_servings
        )

    def _get_or_create_ingredient(
            self, ingredient_name: str, lang: str = "en-US"
    ) -> Ingredient:
        most_similar = self.find_most_similar_ingredient(ingredient_name)
        most_similar_score = most_similar[0][1] if most_similar else None

        if most_similar_score is None or most_similar_score < 0.8:
            ingredient = self._create_new_ingredient(ingredient_name, lang=lang)
        else:
            ingredient = most_similar[0][0]

        if ingredient is None:
            raise ValueError(f"Could not find or create ingredient: {ingredient_name}")
        return ingredient

    def _create_new_ingredient(self, item_name: str, lang: str = "en-US") -> Ingredient:
        item = Ingredient.new(name=item_name, id=None, lang=lang)
        item_id = (
            self.mongo_client["recipes"]["ingredients"]
            .insert_one(item.model_dump(by_alias=True, exclude_none=True))
            .inserted_id
        )
        item.id = item_id
        return item

    def _create_recipe_ingredient(
            self,
            ingredient: Ingredient,
            parsed_ingredient: ParsedIngredient,
            recipe_servings=1,
    ) -> RecipeIngredient:
        if recipe_servings == 0:
            recipe_servings = 1

        quantity: float = float(
            (self._get_quantity(parsed_ingredient) or 1) / recipe_servings
        )
        unit = self._get_unit(parsed_ingredient)
        comment = self._get_comment(parsed_ingredient)

        recipe_ingredient = RecipeIngredient.new(ingredient, comment, quantity, unit)
        return recipe_ingredient

    @staticmethod
    def _get_quantity(parsed_ingredient: ParsedIngredient) -> Union[float, None]:
        if parsed_ingredient.amount and parsed_ingredient.amount[0].quantity:
            try:
                return float(parsed_ingredient.amount[0].quantity)
            except ValueError:
                self.logger.info(
                    f"Could not parse quantity: {parsed_ingredient.amount[0].quantity}"
                )
                return None
        return None

    @staticmethod
    def _get_unit(parsed_ingredient: ParsedIngredient) -> Union[str, None]:
        if parsed_ingredient.amount and parsed_ingredient.amount[0].unit:
            return str(parsed_ingredient.amount[0].unit)
        return None

    @staticmethod
    def _get_comment(parsed_ingredient: ParsedIngredient) -> Union[str, None]:
        if parsed_ingredient.comment:
            comment = parsed_ingredient.comment.text
            # Extract the comment from the parentheses
            comment_pattern = re.compile(
                r"[^\(\)\s]+(?:\s[^\(\)\s]+)*(?:\([^\(\)]+\))*"
            )
            matches = comment_pattern.findall(comment)
            extracted_comment = " ".join(matches)
            return extracted_comment
        return None

    @staticmethod
    def parse_steps(steps: str, lang: str = "en-US"):
        split_steps = steps.split("\n")

        recipe_steps = []
        for step_desc in split_steps:
            # Create the recipe step
            description: MultiLanguageField = MultiLanguageField.new(lang, step_desc)
            temperature: int = extract_temperature(step_desc)
            durations = extract_durations(step_desc)
            summed_durations = sum(durations) if len(durations) > 0 else None
            # TODO: add more fields to the recipe step

            recipe_step = RecipeStep.new(
                description=description,
                ingredients=None,
                duration=summed_durations,
                temperature=temperature,
            )
            recipe_steps.append(recipe_step)

        return recipe_steps

    def find_most_similar_ingredient(self, name: str) -> List[Tuple[Ingredient, float]]:
        ingredients: List[Ingredient] = [
            Ingredient(**doc)
            for doc in self.mongo_client["recipes"]["ingredients"].find()
        ]

        most_similar = []
        for ingredient in ingredients:
            max_similarity = max(
                SequenceMatcher(
                    None, name.lower(), ingredient.name[lang].lower()
                ).ratio()
                for lang in ingredient.name.get_langs()
            )
            most_similar.append((ingredient, max_similarity))

        return sorted(most_similar, key=lambda x: x[1], reverse=True)

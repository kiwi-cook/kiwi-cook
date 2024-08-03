from difflib import SequenceMatcher
from typing import Union, List, Tuple

import pint
from bson import encode
from ingredient_parser import parse_ingredient
from ingredient_parser.dataclasses import ParsedIngredient
from recipe_scrapers import scrape_html

from models.recipe import Recipe, MultiLanguageField, Ingredient, RecipeStep, RecipeIngredient, RecipeSource
from pipeline.pipeline import PipelineElement
from util.parse import extract_temperature, extract_durations


class RecipeScraper(PipelineElement):
    def __init__(self, mongo_client):
        super().__init__("Scraper")
        self.mongo_client = mongo_client

    async def process_task(self, url: str, html: str):
        recipe = self.scrape_html(url, html)
        # Convert Pydantic model to dictionary
        recipe_dict = recipe.model_dump(by_alias=True, exclude_none=True, exclude_unset=True, mode='json')
        # Encode the document to BSON to check if there are any issues
        encoded_document = encode(recipe_dict)
        print(f"Encoded document: {encoded_document}")
        self.mongo_client['recipes']['recipes'].insert_one(recipe_dict)
        return recipe

    def scrape_html(self, url: str, html: str):
        """
        Parses a recipe from a given URL and HTML content.

        Args:
            url: The URL of the page to parse.
            html: The HTML content of the page.
        """
        scraper = scrape_html(html=html, org_url=url)

        lang = scraper.language() or 'en'
        name = MultiLanguageField.new(lang, scraper.title())
        description = MultiLanguageField.new(lang, scraper.description())
        ingredients = scraper.ingredients()
        ingredients = self.parse_ingredients(ingredients, lang=lang)

        instructions = scraper.instructions()
        steps: List[RecipeStep] = self.parse_steps(instructions, lang)
        duration = scraper.total_time()

        image_url = scraper.image()
        author = scraper.author()
        source = RecipeSource.from_author([author])
        source.url = url

        return Recipe(
            name=name,
            description=description,
            ingredients=ingredients,
            steps=steps,
            duration=duration,
            src=source,
            image_url=image_url,
            props={}
        )

    def parse_ingredients(self, ingredients: Union[str, List[str]], lang: str = 'en') -> List[RecipeIngredient]:
        if isinstance(ingredients, str):
            ingredients = [ingredients]

        return [self._process_single_ingredient(ingredient, lang=lang) for ingredient in ingredients]

    def _process_single_ingredient(self, ingredient_name: str, lang: str = 'en') -> RecipeIngredient:
        parsed_ingredient = parse_ingredient(ingredient_name)
        ingredient = self._get_or_create_ingredient(ingredient_name=parsed_ingredient.name.text, lang=lang)
        print(f'Parsed ingredient: {parsed_ingredient}, ingredient: {ingredient_name}')
        return self._create_recipe_ingredient(ingredient, parsed_ingredient)

    def _get_or_create_ingredient(self, ingredient_name: str, lang: str = 'en') -> Ingredient:
        most_similar = self.find_most_similar_ingredient(ingredient_name)[0]
        most_similar_score = most_similar[1] if most_similar else None
        print(f"Most similar ingredients: {most_similar} with score: {most_similar_score}")

        if most_similar_score < 0.8:
            ingredient = self._create_new_ingredient(ingredient_name, lang=lang)
        else:
            ingredient = most_similar[0]

        if ingredient is None:
            raise ValueError(f"Could not find or create ingredient: {ingredient_name}")
        print(f"Found or created ingredient: {ingredient}")
        return ingredient

    def _create_new_ingredient(self, item_name: str, lang: str = 'en') -> Ingredient:
        item = Ingredient.new(name=item_name, id=None, lang=lang)
        item_id = self.mongo_client['recipes']['ingredients'].insert_one(
            item.model_dump(by_alias=True, exclude_none=True)
        ).inserted_id
        item.id = item_id
        return item

    def _create_recipe_ingredient(self, ingredient: Ingredient,
                                  parsed_ingredient: ParsedIngredient) -> RecipeIngredient:
        quantity: float = self._get_quantity(parsed_ingredient)
        unit = str(self._get_unit(parsed_ingredient))

        recipe_ingredient = RecipeIngredient.new(ingredient, quantity, unit)
        return recipe_ingredient

    @staticmethod
    def _get_quantity(parsed_ingredient: ParsedIngredient) -> Union[float, None]:
        if parsed_ingredient.amount and parsed_ingredient.amount[0].quantity:
            return float(parsed_ingredient.amount[0].quantity)
        return None

    @staticmethod
    def _get_unit(parsed_ingredient: ParsedIngredient) -> Union[pint.Unit, None]:
        if parsed_ingredient.amount and parsed_ingredient.amount[0].unit:
            return parsed_ingredient.amount[0].unit
        return None

    @staticmethod
    def parse_steps(steps: str, lang: str = 'en'):
        split_steps = steps.split('\n')

        recipe_steps = []
        for step_desc in split_steps:
            # Create the recipe step
            description: MultiLanguageField = MultiLanguageField.new(lang, step_desc)
            temperature: int = extract_temperature(step_desc)
            durations: list[float] = extract_durations(step_desc)
            summed_durations = sum(durations) if len(durations) > 0 else None
            # TODO: add more fields to the recipe step

            recipe_step = RecipeStep.new(description, None, summed_durations, temperature)
            recipe_steps.append(recipe_step)

        return recipe_steps

    def find_most_similar_ingredient(self, name: str) -> List[Tuple[Ingredient, float]]:
        ingredients: List[Ingredient] = [Ingredient(**doc) for doc in
                                         self.mongo_client['recipes']['ingredients'].find()]
        print(f'Number of ingredients found: {len(ingredients)}: {ingredients}')

        most_similar = []
        for ingredient in ingredients:
            max_similarity = max(
                SequenceMatcher(None, name.lower(), ingredient.name[lang].lower()).ratio()
                for lang in ingredient.name.get_langs()
            )
            most_similar.append((ingredient, max_similarity))

        return sorted(most_similar, key=lambda x: x[1], reverse=True)

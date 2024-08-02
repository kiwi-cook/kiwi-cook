from difflib import SequenceMatcher
from typing import Union, List, Tuple

import pint
from ingredient_parser import parse_ingredient
from recipe_scrapers import scrape_html

from models.recipe import Recipe, LocalizedString, Ingredient, RecipeStep, RecipeIngredient
from pipeline.pipeline import PipelineElement
from util.parse import extract_temperature, extract_durations


class RecipeScraper(PipelineElement):
    def __init__(self, mongo_client):
        super().__init__("Scraper")
        self.mongo_client = mongo_client

    async def process_task(self, url: str, html: str):
        recipe = self.scrape_html(url, html)
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
        name = LocalizedString.new(lang, scraper.title())
        description = LocalizedString.new(lang, scraper.description())
        ingredients = scraper.ingredients()
        ingredients = self.parse_ingredients(ingredients)

        instructions = scraper.instructions()
        steps: List[RecipeStep] = self.parse_steps(instructions, lang)
        duration = scraper.total_time()

        img_url = scraper.image()
        author = scraper.author()
        host = scraper.host()

        return Recipe(
            name=name,
            description=description,
            ingredients=ingredients,
            steps=steps,
            duration=duration,
            props={'img_url': img_url, 'author': author, 'host': host}
        )

    def parse_ingredients(self, ingredients: Union[str, List[str]]) -> List[RecipeIngredient]:
        if isinstance(ingredients, str):
            ingredients = [ingredients]

        return [self._process_single_ingredient(ingredient) for ingredient in ingredients]

    def _process_single_ingredient(self, ingredient: str) -> RecipeIngredient:
        parsed_ingredient = parse_ingredient(ingredient)
        item = self._get_or_create_ingredient(parsed_ingredient.name.text)
        return self._create_recipe_ingredient(item, parsed_ingredient)

    def _get_or_create_ingredient(self, item_name: str) -> Ingredient:
        most_similar = self.find_most_similar_ingredient(item_name)

        ingredient = None
        if not most_similar or len(most_similar) == 0 or (len(most_similar) == 1 and most_similar[0][1] == 0):
            ingredient = self._create_new_ingredient(item_name)
        elif most_similar[0][1] < 0.8:
            ingredient = most_similar[0][0]

        return ingredient

    def _create_new_ingredient(self, item_name: str) -> Ingredient:
        item = Ingredient.new(name=item_name, id=None)
        item_id = self.mongo_client['recipes']['items'].insert_one(
            item.model_dump(by_alias=True, exclude_none=True)
        ).inserted_id
        item.id = item_id
        return item

    def _create_recipe_ingredient(self, ingredient: Ingredient, parsed_ingredient) -> RecipeIngredient:
        quantity: float = self._get_quantity(parsed_ingredient)
        unit = str(self._get_unit(parsed_ingredient))

        recipe_ingredient = RecipeIngredient.new(ingredient, quantity, unit)
        return recipe_ingredient

    @staticmethod
    def _get_quantity(parsed_ingredient) -> Union[float, None]:
        if parsed_ingredient.amount and parsed_ingredient.amount[0].quantity:
            return float(parsed_ingredient.amount[0].quantity)
        return None

    @staticmethod
    def _get_unit(parsed_ingredient) -> Union[pint.Unit, None]:
        if parsed_ingredient.amount and parsed_ingredient.amount[0].unit:
            return parsed_ingredient.amount[0].unit
        return None

    @staticmethod
    def parse_steps(steps: str, lang: str = 'en'):
        split_steps = steps.split('\n')

        recipe_steps = []
        for step_desc in split_steps:
            # Create the recipe step
            description: LocalizedString = LocalizedString.new(lang, step_desc)
            temperature: int = extract_temperature(step_desc)
            durations: list[float] = extract_durations(step_desc)
            summed_durations = sum(durations) if len(durations) > 0 else None
            # TODO: add more fields to the recipe step

            recipe_step = RecipeStep.new(description, None, summed_durations, temperature)
            recipe_steps.append(recipe_step)

        return recipe_steps

    def find_most_similar_ingredient(self, name: str) -> List[Tuple[Ingredient, float]]:
        """
        Finds the most similar ingredient to the given name.

        Args:
            name (str): Name to find the most similar ingredient to.

        Returns:
            List[Tuple[Ingredient, float]]: A list of tuples containing the ingredient and its similarity to the given name.
        """
        ingredients = list(self.mongo_client['recipes']['ingredients'].find())
        print(f'Number of ingredients found: {len(ingredients)}')

        most_similar = []
        for ing in ingredients:
            ingredient = Ingredient(
                id=ing['_id'],
                name=LocalizedString(**ing['name'])
            )
            max_similarity = max(
                SequenceMatcher(None, name.lower(), ingredient.name[lang].lower()).ratio()
                for lang in ingredient.name.get_langs()
            )
            most_similar.append((ingredient, max_similarity))

        return sorted(most_similar, key=lambda x: x[1], reverse=True)

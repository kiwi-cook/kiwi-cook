from difflib import SequenceMatcher

from ingredient_parser import parse_ingredient
from recipe_scrapers import scrape_html

from models.item import Item
from models.recipe import Recipe, LocalizedString, Ingredient, RecipeStep
from pipeline.pipeline import PipelineElement
from util.parse import extract_temperature, extract_durations


class RecipeScraper(PipelineElement):
    def __init__(self, mongo_client):
        super().__init__("Scraper")
        self.mongo_client = mongo_client

    async def process_task(self, task: str):
        html = task

        recipe = self.scrape_html(html)
        return recipe

    def scrape_html(self, html: str):
        """
        Parses a recipe from a given URL.

        :param html:
        """
        scraper = scrape_html(html)

        lang = scraper.language()
        if lang is None:
            lang = 'en'
        name = LocalizedString.new(lang, scraper.title())
        description = LocalizedString.new(lang, scraper.description())
        items = self.parse_ingredients(scraper.ingredients())
        steps = self.parse_steps(scraper.instructions(), lang)

        # duration
        duration = scraper.total_time()

        # props
        img_url = scraper.image()

        # src
        author = scraper.author()
        host = scraper.host()

        return Recipe(
            name=name,
            description=description,
            items=items,
            steps=steps,
            props={'img_url': img_url, 'author': author, 'host': host}
        )

    def parse_ingredients(items: str | list[str]) -> list[Ingredient]:
        if isinstance(items, str):
            items = [items]

        recipe_items = list()
        for ingredient in items:

            # Parse the ingredient
            parsed_ingredient = parse_ingredient(ingredient)

            # ... and find the most similar item
            most_similar = RecipeScraper.find_most_similar_item(parsed_ingredient.name.text)
            print(
                f'Parsed {ingredient} -> {parsed_ingredient}. Most similar {most_similar[0][0]} [{most_similar[0][1] * 100}%]',
                end='\n---\n')

            # Check if the most similar item is similar enough
            if most_similar[0][1] < 0.5:
                # If not, create a new item
                # TODO: Add a way to add new items
                item = Item.create(parsed_ingredient.name.text, 'ingredient')
                item_id = client['items'].insert_one(item.model_dump(by_alias=True, exclude_none=True)).inserted_id
                item.id = item_id
                print(f'Created new item: {item}')
            else:
                # Otherwise, use the most similar item
                item = most_similar[0][0]
                print(f'Using existing item: {item}')

            # Create the recipe item
            quantity = float(parsed_ingredient.amount[0].quantity) if parsed_ingredient.amount and \
                                                                      parsed_ingredient.amount[
                                                                          0].quantity else None
            unit = parsed_ingredient.amount[0].unit if parsed_ingredient.amount and parsed_ingredient.amount[
                0].unit else None
            recipe_item = Ingredient.new(item_id=item.id, quantity=quantity, unit=unit)
            print(f'Item: {recipe_item} with id: {recipe_item.id}, quantity: {quantity}, unit: {unit}', end='\n---\n')

            # Add the recipe item to the list
            recipe_items.append(recipe_item)

        return recipe_items

    @staticmethod
    def parse_steps(steps: str, lang: str = 'en'):
        split_steps = steps.split('\n')

        recipe_steps = []
        for step_desc in split_steps:
            # Create the recipe step
            desc = LocalizedString.new(lang, step_desc)
            temperature = extract_temperature(step_desc)
            durations = extract_durations(step_desc)
            summed_durations = sum(durations) if len(durations) > 0 else None
            # TODO: add more fields to the recipe step

            recipe_step = RecipeStep.new(desc, None, summed_durations, temperature)
            recipe_steps.append(recipe_step)

        return recipe_steps

    def find_most_similar_item(self, name: str):
        """
        Finds the most similar item to the given name.
        :param name: name to find the most similar item to
        :param client: MongoDB client
        :return: a list of tuples containing the item and its similarity to the given name
        """
        items = list(map(lambda x: Item(**x), self.mongo_client['items'].find()))

        # Find items with the most similar name
        most_similar = []
        for item in items:
            # Calculate the similarly between the given name and the item's name
            # for each language
            for lang in item.name.get_langs():
                similarity = SequenceMatcher(None, name, item.name[lang]).ratio()
                most_similar.append((item, similarity))

        # Sort the items by their similarity
        most_similar.sort(key=lambda x: x[1], reverse=True)

        return most_similar

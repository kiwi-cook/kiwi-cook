import re
import logging
import traceback
from difflib import SequenceMatcher
from typing import Optional, Union, List, Tuple, Dict, Any

from bson import encode
from ingredient_parser import parse_ingredient
from ingredient_parser.dataclasses import ParsedIngredient
from recipe_scrapers import scrape_html

from lib.parse import extract_temperature, extract_durations, extract_steps
from lib.pipeline.recipe.pipeline import PipelineElement
from models.recipe import (
    Recipe,
    MultiLanguageField,
    Ingredient,
    RecipeStep,
    RecipeIngredient,
    RecipeSource, RecipeAuthor,
)

logger = logging.getLogger(__name__)

class RecipeParsingError(Exception):
    """Custom exception for recipe parsing errors."""
    pass

class ParseRecipeHtml(PipelineElement):
    """
    A pipeline element that parses recipe HTML content and stores it in MongoDB.

    This class handles the extraction and processing of recipe data from HTML content,
    including ingredients, steps, and metadata.
    """

    SIMILARITY_THRESHOLD = 0.8

    def __init__(self, mongo_client) -> None:
        """
        Initialize the ParseRecipeHtml pipeline element.

        Args:
            mongo_client: MongoDB client instance for database operations
        """
        super().__init__("ParseRecipeHtml")
        self.mongo_client = mongo_client
        self.db = self.mongo_client["recipes"]

    async def process_task(self, url: str, html: str) -> Optional[Recipe]:
        if not html:
            self.logger.error(f"Empty HTML content for URL: {url}")
            return None

        try:
            recipe = self._scrape_html(url, html)
            if recipe:
                self._save_recipe(recipe, url)
                return recipe
        except Exception as e:
            self.logger.error(f"Failed to process recipe from {url}: {str(e)}")
            raise RecipeParsingError(f"Recipe processing failed: {str(e)}")

        return None

    def _save_recipe(self, recipe: Recipe, url: str) -> None:
        try:
            recipe_dict = recipe.model_dump(
                by_alias=True,
                exclude_none=True,
                exclude_unset=True,
                mode="json"
            )
            encode(recipe_dict)  # Validate BSON encoding
            self.db["recipes"].update_one(
                {"url": url},
                {"$set": recipe_dict},
                upsert=True
            )
        except Exception as e:
            self.logger.error(f"Failed to save recipe: {str(e)}")
            raise RecipeParsingError(f"Recipe save failed: {str(e)}")

    def _scrape_html(self, url: str, html: str) -> Optional[Recipe]:
        try:
            scraper = scrape_html(html=html, org_url=url)
            return self._create_recipe_from_scraper(scraper, url)
        except Exception as e:
            tb = traceback.format_exc()
            self.logger.error(f"Failed to scrape recipe from {url}: {str(e)}")
            self.logger.error(tb)
            return None

    def _create_recipe_from_scraper(self, scraper: Any, url: str) -> Recipe:
        lang = scraper.language() or "en-US"
        servings = self._parse_servings(scraper.yields())

        recipe = Recipe(
            name=MultiLanguageField.new(lang, scraper.title()),
            lang=lang,
            description=MultiLanguageField.new(lang, scraper.description()),
            ingredients=self._parse_ingredients(
                scraper.ingredients(),
                lang=lang,
                recipe_servings=servings[0] if servings else 1
            ),
            steps=ParseRecipeHtml._parse_steps(scraper.instructions(), lang),
            duration=scraper.total_time(),
            src=ParseRecipeHtml._create_source(scraper.author(), url),
            image_url=scraper.image(),
            props={"tags": ParseRecipeHtml._get_tags(scraper)},
            servings=servings[0] if servings else 1,
            id=None,
            deleted=False,
            cuisine=None,
            difficulty="medium",
            rating=None,
            nutrition=None,
            video_url=None,
        )

        logger.info(f"Created recipe: {recipe.name[lang]}")
        return recipe

    @staticmethod
    def _parse_servings(servings: str) -> List[int]:
        if not servings:
            return []

        # Extract numbers from the servings string
        servings_pattern = re.compile(r"\d+")
        return [int(num) for num in servings_pattern.findall(servings)]

    @staticmethod
    def _create_source(authors: Union[str, List[str]], url: str) -> RecipeSource:
        url = url if url else None
        return RecipeSource(
            url=url,
            authors=[RecipeAuthor(name=author) for author in authors]
        )

    @staticmethod
    def _get_tags(scraper: Any) -> List[str]:
        try:
            tags = scraper.tags()
        except AttributeError:
            tags = None
        return tags if tags else []

    def _parse_ingredients(
            self, ingredients: Union[str, List[str]], lang: str = "en", recipe_servings=1
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
            self, ingredient_name: str, lang: str = "en", recipe_servings=1
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
            self, ingredient_name: str, lang: str = "en"
    ) -> Ingredient:
        most_similar = self.find_most_similar_ingredient(ingredient_name)
        most_similar_score = most_similar[0][1] if most_similar else None

        if most_similar_score is None or most_similar_score < self.SIMILARITY_THRESHOLD:
            ingredient = self._create_new_ingredient(ingredient_name, lang=lang)
        else:
            ingredient = most_similar[0][0]

        if ingredient is None:
            raise ValueError(f"Could not find or create ingredient: {ingredient_name}")
        return ingredient

    def _create_new_ingredient(self, item_name: str, lang: str = "en") -> Ingredient:
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
    def _parse_steps(steps: Union[str, List[str]], lang: str = "en") -> List['RecipeStep']:
        # Use extract_steps to ensure we handle both string and list inputs
        split_steps = extract_steps(steps)

        recipe_steps = []
        for step_desc in split_steps:
            # Create the recipe step
            description = MultiLanguageField.new(lang, step_desc)
            temperature = extract_temperature(step_desc)
            durations = extract_durations(step_desc)
            summed_durations = sum(durations) if durations else None

            # Create the recipe step object
            recipe_step = RecipeStep.new(
                description=description,
                ingredients=None,  # Assuming ingredients are processed elsewhere
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

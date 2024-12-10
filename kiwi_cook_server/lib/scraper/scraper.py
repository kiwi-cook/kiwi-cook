import json

import requests
from bs4 import BeautifulSoup
from pymongo.errors import PyMongoError
from recipe_scrapers import scrape_html, RecipeSchemaNotFound, WebsiteNotImplementedError

from lib.database.mongodb import get_mongodb
from lib.logging import logger
from lib.scraper.utils import extract_number_from_string, image_url_to_base64s, safe_extract
from models.recipe import Recipe


def __parse_recipe_schema(__url: str) -> Recipe or None:
    try:
        scraper = scrape_html(html=None, org_url=__url, online=True)
    except (RecipeSchemaNotFound, WebsiteNotImplementedError) as e:
        # Log the error and return None if the scraper cannot be initialized
        logger.error(f"Error initializing scraper for URL {__url}: {e}")
        return None

    # Use the helper function to extract fields safely
    try:
        return Recipe(
            name=safe_extract(scraper.title),
            description=safe_extract(scraper.description),
            image=safe_extract(scraper.image, post_processes=[image_url_to_base64s]),
            ingredients=safe_extract(scraper.ingredients),
            instructions=safe_extract(scraper.instructions_list),
            prep_time=safe_extract(scraper.prep_time),
            cook_time=safe_extract(scraper.cook_time),
            total_time=safe_extract(scraper.total_time),
            servings=safe_extract(scraper.yields, post_processes=[extract_number_from_string, int]),
            url=__url,
            author=safe_extract(scraper.author),
            language=safe_extract(scraper.language),
        )
    except Exception as e:
        logger.error(f"Error extracting recipe data: {e}")
        return None


def __parse_recipe_ld_json(__url: str) -> Recipe or None:
    """
    Custom scraper to extract recipe data from LD+JSON schema in a webpage.
    """
    try:
        # Fetch the webpage content
        response = requests.get(__url)
        response.raise_for_status()  # Raise an error for bad responses (4xx, 5xx)

        # Parse the HTML content
        soup = BeautifulSoup(response.text, "html.parser")

        # Find all <script> tags with type="application/ld+json"
        ld_json_scripts = soup.find_all("script", type="application/ld+json")

        # Iterate through the scripts to find the one containing the recipe schema
        for script in ld_json_scripts:
            try:
                # Parse the JSON content
                data = json.loads(script.string)

                # Handle cases where the JSON contains a "@graph" (multiple schemas)
                if "@graph" in data:
                    for item in data["@graph"]:
                        if item["@type"] == "Recipe":
                            return __extract_recipe_data(item, __url)

                # Handle cases where the JSON is a single object
                elif data["@type"] == "Recipe":
                    return __extract_recipe_data(data, __url)

            except (json.JSONDecodeError, KeyError, TypeError):
                # Skip invalid or non-recipe JSON-LD scripts
                continue

    except requests.RequestException as e:
        logger.error(f"Error fetching the URL: {e}")
        return None

    # Return None if no recipe schema is found
    return None


def __extract_recipe_data(data: dict, __url: str) -> Recipe:
    """
    Extracts recipe data from a JSON-LD object and maps it to the Recipe model.
    """
    return Recipe(
        name=data.get("name"),
        description=data.get("description"),
        ingredients=data.get("recipeIngredient", []),
        instructions=[
            step.get("text", "") if isinstance(step, dict) else step
            for step in data.get("recipeInstructions", [])
        ],
        image=image_url_to_base64s(data.get("image")),
        url=__url,
        author=data.get("author", {}).get("name"),
        prep_time=int(extract_number_from_string(data.get("prepTime", ""))),
        cook_time=int(extract_number_from_string(data.get("cookTime", ""))),
        total_time=int(extract_number_from_string(data.get("totalTime", ""))),
        servings=int(extract_number_from_string(data.get("recipeYield", ""))),
    )


def parse_recipe(url: str) -> Recipe or None:
    logger.info(f"Parsing recipe from URL: {url}")
    # Try to parse the recipe schema
    recipe = __parse_recipe_schema(url)
    if recipe:
        logger.info(f"Recipe parsed successfully from URL: {url}")
        return recipe

    # Try to parse the LD+JSON schema
    recipe = __parse_recipe_ld_json(url)
    if recipe:
        logger.info(f"Recipe parsed successfully from URL (LD+JSON): {url}")
        return recipe

    # Return None if no recipe schema is found
    logger.error(f"No recipe found for URL: {url}")
    return None


def upsert_recipe(recipe: Recipe) -> bool:
    """
    Upsert a recipe into the database.

    Args:
        recipe (Recipe): The recipe to upsert.

    Returns:
        bool: True if the recipe was successfully upserted, False otherwise.
    """
    try:
        write_mongo_client = get_mongodb("WRITE")
        write_mongo_client["recipes"]["recipes"].replace_one(
            {"url": recipe.url},
            recipe.model_dump(),
            upsert=True
        )
        return True
    except PyMongoError as e:
        logger.error(f"Error upserting recipe: {e}")
        return False


# Test the function
if __name__ == "__main__":
    # Read in URL file and parse recipes
    with open("../../data/urls.txt", "r") as file:
        urls = file.read().splitlines()
        for url in urls:
            recipe = parse_recipe(url)
            if recipe:
                upsert_recipe(recipe)
            else:
                logger.error(f"No recipe found for URL: {url}")

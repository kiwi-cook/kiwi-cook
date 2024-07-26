from fastapi import APIRouter
from starlette import status

from models.api import APIResponseList
from models.recipe import Recipe
from pipeline.scraper import RecipeScraper
from server.app import client

router = APIRouter()


@router.post("/recipe/",
             response_description="Add new recipes",
             response_model=APIResponseList[str],
             status_code=status.HTTP_201_CREATED,
             response_model_by_alias=False,
             response_model_exclude_none=True,
             )
def create_recipes(recipes: list[Recipe]):
    error = False
    inserted_recipes = client['recipes'].insert_many(
        [recipe.model_dump(by_alias=True, exclude_none=True) for recipe in recipes])
    if len(inserted_recipes.inserted_ids) != len(recipes):
        error = True
    inserted_ids = [str(recipeId) for recipeId in inserted_recipes.inserted_ids]
    return {"error": error, "response": inserted_ids}


@router.post("/recipe/parse",
             response_description="Parse recipes from URLs",
             response_model=APIResponseList[str],
             status_code=status.HTTP_201_CREATED,
             response_model_by_alias=False,
             response_model_exclude_none=True,
             )
def parse_recipes(recipe_urls: list[str]):
    error = False
    parsed_recipes = []
    for url in recipe_urls:
        recipe = RecipeScraper.scrape_html(url, client)
        parsed_recipes.append(recipe)
    inserted_recipes = client['recipes'].insert_many(
        [recipe.model_dump(by_alias=True, exclude_none=True) for recipe in parsed_recipes])
    if len(inserted_recipes.inserted_ids) != len(recipe_urls):
        error = True
    inserted_ids = [str(recipeId) for recipeId in inserted_recipes.inserted_ids]
    return {"error": error, "response": inserted_ids}

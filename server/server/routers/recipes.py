from typing import List

from fastapi import APIRouter

from database.mongodb import get_database
from models.api import APIResponseList
from models.recipe import Recipe, Ingredient
from pipeline.recipe_pipeline import run_pipeline

client = get_database()
router = APIRouter()


@router.get(
    "/recipe/",
    response_description="Get all recipes",
    response_model=APIResponseList[Recipe],
    response_model_by_alias=False,
    response_model_exclude_none=True,
)
def read_recipes():
    return {"error": False, "response": list(client["recipes"]["recipes"].find())}

@router.get(
    "/recipe/add",
    response_description="Add a recipe",
    response_model_by_alias=False,
    response_model_exclude_none=True,
)
async def add_recipe(url: str):
    await run_pipeline([url])
    return {"error": False, "response": "Recipe added to the database."}


@router.get(
    "/recipe/{recipe_id}",
    response_description="Get recipe information",
    response_model=APIResponseList[Recipe],
    response_model_by_alias=False,
    response_model_exclude_none=True,
)
def read_recipe(recipe_id: str):
    return {
        "error": False,
        "response": list(client["recipes"]["recipes"].find({"_id": recipe_id})),
    }

@router.post(
    "/recipe/add/",
    response_description="Add a list of recipes",
    response_model_by_alias=False,
    response_model_exclude_none=True,
)
async def add_recipe_list(urls: List[str]):
    await run_pipeline(urls)
    return {"error": False, "response": f"{len(urls)} recipes added to the database."}


@router.get(
    "/ingredient",
    response_description="Get all ingredients",
    response_model=APIResponseList[Ingredient],
    response_model_by_alias=False,
    response_model_exclude_none=True,
)
def read_ingredients():
    return {"error": False, "response": list(client["recipes"]["ingredients"].find())}

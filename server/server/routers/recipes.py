from fastapi import APIRouter

from models.api import APIResponseList
from models.recipe import Recipe
from mongodb import get_database

client = get_database()
router = APIRouter()


@router.get("/recipe/",
            response_description="Get all recipes",
            response_model=APIResponseList[Recipe],
            response_model_by_alias=False,
            response_model_exclude_none=True,
            )
def read_recipes():
    return {"error": False, "response": list(client['recipes']['recipes'].find())}


@router.get("/recipe/{recipe_id}",
            response_description="Get recipe information",
            response_model=APIResponseList[Recipe],
            response_model_by_alias=False,
            response_model_exclude_none=True,
            )
def read_recipe(recipe_id: str):
    return {"error": False, "response": list(client['recipes'].find({'_id': recipe_id}))}

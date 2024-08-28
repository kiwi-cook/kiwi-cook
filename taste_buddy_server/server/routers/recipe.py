from fastapi import APIRouter, Depends
from typing_extensions import Annotated

from database.mongodb import get_database
from models.api import APIResponseList
from models.recipe import Recipe
from models.user import User, get_current_active_user
from pipeline.recipe_pipeline import run_pipeline

client = get_database()
router = APIRouter(
    prefix="/recipe",
    tags=["recipes"],
)


@router.get(
    "/",
    response_description="Get all recipes",
    response_model=APIResponseList[Recipe],
    response_model_by_alias=False,
    response_model_exclude_none=True,
)
def read_recipes():
    return {"error": False, "response": list(client["recipes"]["recipes"].find())}


@router.get(
    "/{recipe_id}",
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
    "/url/",
    response_description="Add a list of recipes from URLs",
    response_model_by_alias=False,
    response_model_exclude_none=True,
)
async def add_recipes(
        current_user: Annotated[User, Depends(get_current_active_user)],
        urls: list[str]):
    if current_user.disabled:
        return {"error": True, "response": "User is not active"}

    await run_pipeline(urls)
    return {"error": False, "response": f"{len(urls)} recipes added to the database."}

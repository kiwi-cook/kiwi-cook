import logging
from typing import Annotated

from fastapi import APIRouter, Depends
from starlette import status

from lib.database.mongodb import get_mongodb
from lib.pipeline.recipe import run_html_pipeline
from models.api import APIResponseList
from models.recipe import Recipe
from models.user import get_admin_user, User

router = APIRouter(prefix="/recipe", tags=["recipes"])

logger = logging.getLogger(__name__)


@router.post(
    "/",
    response_description="Add new recipes",
    response_model=APIResponseList[str],
    status_code=status.HTTP_201_CREATED,
    response_model_by_alias=False,
    response_model_exclude_none=True,
)
def create_recipes(
        current_user: Annotated[User, Depends(get_admin_user)], recipes: list[Recipe]
):
    write_client = get_mongodb(rights="WRITE")
    error = False
    inserted_recipes = write_client["recipes"].insert_many(
        [recipe.model_dump(by_alias=True, exclude_none=True) for recipe in recipes]
    )
    if len(inserted_recipes.inserted_ids) != len(recipes):
        error = True
    inserted_ids = [str(recipeId) for recipeId in inserted_recipes.inserted_ids]
    return {"error": error, "response": inserted_ids}


@router.post(
    "/parse",
    response_description="Parse recipes from URLs",
    response_model=APIResponseList[str],
    status_code=status.HTTP_201_CREATED,
    response_model_by_alias=False,
    response_model_exclude_none=True,
)
async def parse_recipes(
        current_user: Annotated[User, Depends(get_admin_user)], recipe_urls: list[str]
):
    error = False
    try:
        await run_html_pipeline(recipe_urls)
    except Exception as e:
        error = True
    return {"error": error, "response": f"Recipes parsed from {len(recipe_urls)} URLs"}

from fastapi import APIRouter, Depends, HTTPException
from starlette import status
from typing_extensions import Annotated

from database.mongodb import get_database
from models.api import APIResponseList
from models.recipe import Recipe
from models.user import User, get_current_active_user
from pipeline.recipe_pipeline import run_pipeline

router = APIRouter(
    prefix="/recipe",
    tags=["recipes"],
)


@router.get(
    "",
    response_description="Get all recipes",
    response_model=APIResponseList[Recipe],
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
def read_recipes():
    read_client = get_database()
    recipes = list(read_client["recipes"]["recipes"].find())
    if not recipes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No recipes found",
        )
    return {"error": False, "response": recipes}


@router.get(
    "/{recipe_id}",
    response_description="Get recipe information",
    response_model=APIResponseList[Recipe],
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
def read_recipe(recipe_id: str):
    read_client = get_database()
    recipe = list(read_client["recipes"]["recipes"].find({"_id": recipe_id}))
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found",
        )
    return {
        "error": False,
        "response": recipe,
    }


@router.post(
    "/url",
    response_description="Add a list of recipes from URLs",
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_201_CREATED,
)
async def add_recipes(
    current_user: Annotated[User, Depends(get_current_active_user)], urls: list[str]
):
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not active",
        )

    if not urls:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No URLs provided",
        )

    try:
        await run_pipeline(urls)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing recipes: {str(e)}",
        )

    return {"error": False, "response": f"{len(urls)} recipes added to the database."}

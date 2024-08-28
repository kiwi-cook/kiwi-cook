from fastapi import APIRouter

from database.mongodb import get_database
from models.api import APIResponseList

read_client = get_database()
router = APIRouter(
    prefix="/ingredient",
    tags=["recipes"],
)


@router.get(
    "/",
    response_description="Get all ingredients from the database",
    response_model=APIResponseList[str],
    response_model_by_alias=False,
    response_model_exclude_none=True,
    summary="Get all ingredients",
)
def read_ingredients():
    return {
        "error": False,
        "response": list(read_client["recipes"]["ingredients"].find({"type": "ingredient"})),
    }


@router.get(
    "/{ingredient_id}",
    response_description="Get ingredients from the database",
    response_model=APIResponseList[str],
    response_model_by_alias=False,
    response_model_exclude_none=True,
    summary="Get ingredient information",
)
def read_ingredient(ingredient_id: str):
    return {
        "error": False,
        "response": list(read_client["recipes"]["ingredients"].find({"_id": ingredient_id})),
    }

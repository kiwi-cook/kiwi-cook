from fastapi import APIRouter

from models.api import APIResponseList
from server.app import client

router = APIRouter()


@router.get("/ingredient/",
            response_description="Get all ingredients",
            response_model=APIResponseList[str],
            response_model_by_alias=False,
            response_model_exclude_none=True,
            )
def read_ingredients():
    return {"error": False, "response": list(client['items'].find({'type': 'ingredient'}))}


@router.get("/ingredient/{ingredient_id}",
            response_description="Get ingredient information",
            response_model=APIResponseList[str],
            response_model_by_alias=False,
            response_model_exclude_none=True,
            )
def read_ingredient(ingredient_id: str):
    return {"error": False, "response": list(client['items'].find({'_id': ingredient_id}))}

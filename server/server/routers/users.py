from fastapi import APIRouter

from models.api import APIResponseList
from models.recipe import Recipe
from server.app import client

router = APIRouter()


@router.get("/user/{user_id}",
            response_description="Get user information",
            response_model=APIResponseList[str],
            response_model_by_alias=False,
            response_model_exclude_none=True,
            )
def get_user(user_id: str):
    return {"error": False, "response": ["John Doe"]}


@router.get("/user/{user_id}/recipes",
            response_description="Get user's recipes",
            response_model=APIResponseList[Recipe],
            response_model_by_alias=False,
            response_model_exclude_none=True,
            )
def get_user_recipes(user_id: str):
    return {"error": False, "response": list(client['recipes'].find())}


@router.post("/user/{user_id}/recipes/add",
             response_description="Add a recipe",
             response_model=APIResponseList[str],
             response_model_by_alias=False,
             response_model_exclude_none=True,
             )
def add_recipe(user_id: str, recipe_id: str):
    return {"error": False, "response": ["John Doe"]}


@router.post("/user/{user_id}/recipes/remove",
             response_description="Remove a recipe",
             response_model=APIResponseList[str],
             response_model_by_alias=False,
             response_model_exclude_none=True,
             )
def remove_recipe(user_id: str, recipe_id: str):
    return {"error": False, "response": ["John Doe"]}


@router.get("/user/{user_id}/friends",
            response_description="Get user's friends",
            response_model=APIResponseList[str],
            response_model_by_alias=False,
            response_model_exclude_none=True,
            )
def get_user_friends(user_id: str):
    return {"error": False, "response": ["Jane Doe"]}


@router.post("/user/{user_id}/friends/add",
             response_description="Add a friend",
             response_model=APIResponseList[str],
             response_model_by_alias=False,
             response_model_exclude_none=True,
             )
def add_friend(user_id: str, friend_id: str):
    return {"error": False, "response": ["Jane Doe"]}


@router.post("/user/{user_id}/friends/remove",
             response_description="Remove a friend",
             response_model=APIResponseList[str],
             response_model_by_alias=False,
             response_model_exclude_none=True,
             )
def remove_friend(user_id: str, friend_id: str):
    return {"error": False, "response": ["Jane Doe"]}


@router.get("/user/{user_id}/friends/recipes",
            response_description="Get user's friends' recipes",
            response_model=APIResponseList[Recipe],
            response_model_by_alias=False,
            response_model_exclude_none=True,
            )
def get_user_friends_recipes(user_id: str):
    return {"error": False, "response": list(client['recipes'].find())}

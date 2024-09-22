from typing import Annotated

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, APIRouter, Form, Response
from fastapi.security import OAuth2PasswordRequestForm
from starlette import status

from database.mongodb import get_database
from models.api import APIResponse, APIResponseList
from models.user import (
    User,
    get_current_active_user,
    Token,
    authenticate_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    UserInDB,
)
from utils.auth import hash_password

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

load_dotenv()

write_client = get_database(rights="WRITE")
read_client = get_database(rights="READ")


@router.post(
    "/add",
    response_description="Create a new user",
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_201_CREATED,
)
async def create_user(
    username: Annotated[str, Form()],
    password: Annotated[str, Form()],
    response: Response,
):
    if read_client["users"]["users"].find_one({"username": username}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists",
        )

    hashed_password = hash_password(password)
    print(f"Hashed password: {username}[{hashed_password}]")
    user = UserInDB(username=username, hashed_password=hashed_password)

    return {
        "error": False,
        "response": write_client["users"]["users"].insert_one(user.model_dump()),
    }


@router.post(
    "/token",
    response_description="Login user",
    response_model=Token,
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
async def login_user(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
) -> Token:
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        access_token = create_access_token(
            data={"sub": user.username}, expires_minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create access token",
        )

    token = Token(access_token=access_token, token_type="bearer")
    return token


@router.get(
    "/me",
    response_description="Get current user",
    response_model=APIResponse[User],
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_active_user)],
    response: Response,
):
    return {"error": False, "response": current_user}


@router.get(
    "/me/friends/",
    response_description="Get all friends of the current user",
    response_model=APIResponseList[str],
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
async def read_user_friends(
    current_user: Annotated[User, Depends(get_current_active_user)],
    response: Response,
):
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not active",
        )

    return {"error": False, "response": current_user.friends or []}


@router.post(
    "/me/friends/add/",
    response_description="Add a friend to the current user",
    response_model=APIResponseList[str],
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
async def add_user_friend(
    current_user: Annotated[User, Depends(get_current_active_user)],
    friend_username: Annotated[str, Form()],
    response: Response,
):
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not active",
        )

    # If the user has no friends, set it to an empty list
    if current_user.friends is None:
        current_user.friends = []

    if friend_username in current_user.friends:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Friend already added",
        )

    if friend_username == current_user.username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sadly, you can't be friends with yourself",
        )

    friend = read_client["users"]["users"].find_one({"username": friend_username})
    if not friend:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Friend not found",
        )

    current_user.friends.append(friend_username)
    write_client["users"]["users"].update_one(
        {"username": current_user.username}, {"$set": {"friends": current_user.friends}}
    )

    return {"error": False, "response": current_user.friends}


@router.get(
    "/me/recipes/",
    response_description="Get all recipes of the current user",
    response_model=APIResponseList[str],
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
async def read_user_recipes(
    current_user: Annotated[User, Depends(get_current_active_user)],
    response: Response,
):
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not active",
        )

    return {"error": False, "response": current_user.recipes or []}


@router.post(
    "/me/recipes/add/",
    response_description="Add a recipe to the current user",
    response_model=APIResponseList[str],
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
async def add_user_recipe(
    current_user: Annotated[User, Depends(get_current_active_user)],
    recipe_id: Annotated[str, Form()],
    response: Response,
):
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not active",
        )

    # If the user has no recipes, set it to an empty list
    if current_user.recipes is None:
        current_user.recipes = []

    if recipe_id in current_user.recipes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recipe already added",
        )

    current_user.recipes.append(recipe_id)
    write_client["users"]["users"].update_one(
        {"username": current_user.username}, {"$set": {"recipes": current_user.recipes}}
    )

    return {"error": False, "response": current_user.recipes}


@router.post(
    "/me/recipes/remove/",
    response_description="Remove a recipe from the current user",
    response_model=APIResponseList[str],
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
async def remove_user_recipe(
    current_user: Annotated[User, Depends(get_current_active_user)],
    recipe_id: Annotated[str, Form()],
    response: Response,
):
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not active",
        )

    # If the user has no recipes, set it to an empty list
    if current_user.recipes is None:
        current_user.recipes = []

    if recipe_id not in current_user.recipes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found",
        )

    current_user.recipes.remove(recipe_id)
    write_client["users"]["users"].update_one(
        {"username": current_user.username}, {"$set": {"recipes": current_user.recipes}}
    )

    return {"error": False, "response": current_user.recipes}


@router.post(
    "/me/weekplan/generate",
    response_description="Generate a week plan for the current user",
    response_model=APIResponseList[str],
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
async def generate_user_weekplan(
    current_user: Annotated[User, Depends(get_current_active_user)],
    response: Response,
):
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not active",
        )

    if not current_user.paying_customer:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="User is not a paying customer",
        )

    # TODO: Implement the week plan generation logic
    return {"error": False, "response": []}


@router.get(
    "/me/weekplan",
    response_description="Get the week plan of the current user",
    response_model=APIResponseList[str],
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
async def read_user_weekplan(
    current_user: Annotated[User, Depends(get_current_active_user)],
    response: Response,
):
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not active",
        )

    return {"error": False, "response": current_user.weekplan or []}

import json
import logging
import re
from datetime import datetime, timezone
from typing import Annotated
from uuid import uuid4

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Form, Response, Request
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from pymongo.errors import PyMongoError
from starlette import status

import lib.password
from lib.database.mongodb import get_mongodb
from lib.database.redis import get_redis
from lib.token import TokenManager
from models.api import APIResponse, APIResponseList
from models.user import (
    User,
    get_active_user,
    authenticate_user,
    UserInDB,
)

load_dotenv()

write_client = get_mongodb(rights="WRITE")
read_client = get_mongodb(rights="READ")

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/users",
    tags=["users"],
    include_in_schema=True,
)


class UserSecurity:
    @staticmethod
    def track_login_attempt(username: str, success: bool):
        """Track login attempts and block if necessary"""
        key = f"login_attempts:{username}"
        if success:
            get_redis().delete(key)
            return

        attempts = get_redis().incr(key)
        if attempts >= SecurityConfig.MAX_LOGIN_ATTEMPTS:
            block_key = f"login_blocked:{username}"
            get_redis().setex(
                block_key,
                SecurityConfig.LOGIN_BLOCK_MINUTES * 60,
                1
            )

    @staticmethod
    def is_account_blocked(username: str) -> bool:
        """Check if an account is temporarily blocked"""
        return bool(get_redis().get(f"login_blocked:{username}"))

    @staticmethod
    def create_session(user_id: str, device_info: dict) -> str:
        """Create and store session information"""
        session_id = str(uuid4())
        session_data = {
            "user_id": user_id,
            "device": device_info.get("device", "unknown"),
            "ip": device_info.get("ip", "unknown"),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        get_redis().setex(
            f"session:{session_id}",
            SecurityConfig.SESSION_TIMEOUT_MINUTES * 60,
            json.dumps(session_data)
        )
        return session_id


# Security Configuration
class SecurityConfig:
    MAX_LOGIN_ATTEMPTS = 5
    LOGIN_BLOCK_MINUTES = 15
    SESSION_TIMEOUT_MINUTES = 30
    REFRESH_TOKEN_DAYS = 7
    PASSWORD_HISTORY_SIZE = 5


@router.post("/add", status_code=status.HTTP_201_CREATED)
async def create_user(
        request: Request,
        username: Annotated[str, Form()],
        password: Annotated[str, Form()],
        response: Response,
):
    try:
        # Enhanced password validation
        if not lib.password.PasswordManager.validate_password_complexity(password):
            raise HTTPException(
                status_code=400,
                detail="Password must be at least 12 characters and include uppercase, lowercase, numbers, and special characters"
            )

        # Check username requirements
        if not re.match("^[a-zA-Z0-9_]{3,32}$", username):
            raise HTTPException(
                status_code=400,
                detail="Username must be 3-32 characters and contain only letters, numbers, and underscores"
            )

        # Check for existing user with case-insensitive match
        if read_client["users"]["users"].find_one(
                {"username": {"$regex": f"^{username}$", "$options": "i"}}
        ):
            raise HTTPException(status_code=400, detail="Username not available")

        # Create user with enhanced security
        hashed_password = lib.password.PasswordManager.hash_password(password)
        user = UserInDB(
            username=username,
            hashed_password=hashed_password,
            password_changed_at=datetime.now(timezone.utc),
        )

        result = write_client["users"]["users"].insert_one(user.model_dump())

        # Audit logging
        logger.info(f"New user created: {username} from IP: {request.client.host}")

        return {"error": False, "response": str(result.inserted_id)}

    except PyMongoError as e:
        logger.error(f"Database error during user creation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.post("/token")
async def login_for_access_token(
        request: Request,
        form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
        response: Response,
) -> JSONResponse:
    # Check for account blocking
    if UserSecurity.is_account_blocked(form_data.username):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account temporarily blocked due to multiple failed attempts"
        )

    try:
        user = authenticate_user(form_data.username, form_data.password)
        if not user:
            UserSecurity.track_login_attempt(form_data.username, False)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Create session with device tracking
        device_info = {
            "ip": request.client.host,
            "user_agent": request.headers.get("user-agent"),
            "device_id": request.cookies.get("device_id", str(uuid4()))
        }
        session_id = UserSecurity.create_session(user.username, device_info)

        # Generate tokens
        access_token = TokenManager.create_access_token(
            data={
                "sub": user.username,
                "session": session_id,
                "device": device_info["device_id"]
            }
        )

        refresh_token = TokenManager.create_refresh_token(
            data={"sub": user.username, "type": "refresh"},
        )

        # Update user's last login
        write_client["users"]["users"].update_one(
            {"username": user.username},
            {
                "$set": {
                    "last_login": datetime.utcnow(),
                    "failed_login_attempts": 0
                }
            }
        )

        # Create secure response
        response = JSONResponse(
            content={"message": "Login successful"},
            status_code=status.HTTP_200_OK
        )

        # Set secure cookies
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=True,
            samesite="strict",
            max_age=SecurityConfig.SESSION_TIMEOUT_MINUTES * 60
        )

        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=True,
            samesite="strict",
            max_age=SecurityConfig.REFRESH_TOKEN_DAYS * 24 * 60 * 60
        )

        # Audit logging
        logger.info(f"Successful login: {user.username} from IP: {request.client.host}")

        return response

    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.post("/logout")
async def logout(
        request: Request,
        current_user: Annotated[User, Depends(get_active_user)],
        response: Response
):
    try:
        # Invalidate session
        session_id = request.cookies.get("session_id")
        if session_id:
            await get_redis().delete(f"session:{session_id}")

        # Clear cookies
        response = JSONResponse(content={"message": "Logout successful"})
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        response.delete_cookie("session_id")

        # Audit logging
        logger.info(f"User logged out: {current_user.username}")

        return response
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error during logout"
        )


@router.get(
    "/me/",
    response_description="Get current user",
    response_model=APIResponse[User],
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
async def read_users_me(
        current_user: Annotated[User, Depends(get_active_user)],
        response: Response,
):
    return {"error": False, "response": current_user}


@router.get(
    "/me/friends",
    response_description="Get all friends of the current user",
    response_model=APIResponseList[str],
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
async def read_user_friends(
        current_user: Annotated[User, Depends(get_active_user)],
        response: Response,
):
    return {"error": False, "response": current_user.friends or []}


@router.post(
    "/me/friends/add",
    response_description="Add a friend to the current user",
    response_model=APIResponseList[str],
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
async def add_user_friend(
        current_user: Annotated[User, Depends(get_active_user)],
        friend_username: Annotated[str, Form()],
        response: Response,
):
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
        current_user: Annotated[User, Depends(get_active_user)],
        response: Response,
):
    return {"error": False, "response": current_user.recipes or []}


@router.post(
    "/me/recipes/add",
    response_description="Add a recipe to the current user",
    response_model=APIResponseList[str],
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
async def add_user_recipe(
        current_user: Annotated[User, Depends(get_active_user)],
        recipe_id: Annotated[str, Form()],
        response: Response,
):
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
    "/me/recipes/remove",
    response_description="Remove a recipe from the current user",
    response_model=APIResponseList[str],
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
async def remove_user_recipe(
        current_user: Annotated[User, Depends(get_active_user)],
        recipe_id: Annotated[str, Form()],
        response: Response,
):
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

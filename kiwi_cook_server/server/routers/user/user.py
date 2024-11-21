import os
import re
from datetime import datetime, timezone
from typing import Annotated

import requests
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, Form, Response, Request
from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from lib.database.mongodb import get_mongodb
from lib.logging import logger
from models.user import User

load_dotenv()

write_client = get_mongodb(rights="WRITE")
read_client = get_mongodb(rights="READ")

router = APIRouter(
    prefix="/users",
    tags=["users"],
    include_in_schema=True,
)


def validate_password_complexity(password: str) -> bool:
    """
    Password complexity requirements:
    - Minimum 12 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - At least one special character
    """
    if len(password) < 12:
        return False

    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(not c.isalnum() for c in password)

    return has_upper and has_lower and has_digit and has_special


@router.post("/add", status_code=status.HTTP_201_CREATED)
async def create_user(
        request: Request,
        username: Annotated[str, Form()],
        password: Annotated[str, Form()],
        response: Response,
):
    # Enhanced password validation
    if not validate_password_complexity(password):
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 12 characters and include uppercase, lowercase, numbers, and special characters"
        )

    # Check username requirements
    if not re.match("^[a-zA-Z0-9_]{3,32}$", username):
        logger.error(f"Invalid username: {username}")
        raise HTTPException(
            status_code=400,
            detail="Username must be 3-32 characters and contain only letters, numbers, and underscores"
        )

    # Check for existing user with case-insensitive match
    if read_client["users"]["users"].find_one(
            {"username": {"$regex": f"^{username}$", "$options": "i"}}
    ):
        logger.error(f"Username not available: {username}")
        raise HTTPException(status_code=400, detail="Username not available")

    # Create user in FusionAuth
    fusionauth_base_url = os.getenv("FUSIONAUTH_BASE_URL")
    fusionauth_api_key = os.getenv("FUSIONAUTH_API_KEY")

    registration_url = f"{fusionauth_base_url}/api/user/registration"
    headers = {"Authorization": fusionauth_api_key, "Content-Type": "application/json"}
    registration_payload = {
        "user": {
            "name": username,
            "password": password,
        },
        "registration": {
            "applicationId": os.getenv("FUSIONAUTH_APPLICATION_ID"),
        }
    }

    fusionauth_response = requests.post(registration_url, json=registration_payload, headers=headers)
    fusionauth_user_id = fusionauth_response.json()["user"]["id"]

    user = User(username=username,
                fusionauthUserId=fusionauth_user_id,
                createdAt=datetime.now(timezone.utc).isoformat())

    write_client["users"]["users"].insert_one(user.model_dump())

    # Audit logging
    logger.info(f"New user created: {username} from IP: {request.client.host}")

    return {"error": False, "response": "User created successfully"}


@router.post("/token")
def login_for_access_token(request: Request, form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                           response: Response):
    """
    Authenticate user using FusionAuth and return access token.
    """

    fusionauth_base_url = os.getenv("FUSIONAUTH_BASE_URL")
    fusionauth_api_key = os.getenv("FUSIONAUTH_API_KEY")

    login_url = f"{fusionauth_base_url}/api/login"
    headers = {"Authorization": fusionauth_api_key, "Content-Type": "application/json"}
    login_payload = {
        "loginId": form_data.username,
        "password": form_data.password
    }

    # Call FusionAuth Login API
    fusionauth_response = requests.post(login_url, json=login_payload, headers=headers)

    if fusionauth_response.status_code != 200:
        logger.error(f"Failed to authenticate user: {fusionauth_response.text}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract token from FusionAuth response
    token_data = fusionauth_response.json()
    access_token = token_data.get("token")

    if not access_token:
        logger.error(f"Failed to retrieve access token: {token_data}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve access token",
        )

    # Set token in response or return to the client
    response.set_cookie(key="Authorization", value=f"Bearer {access_token}", httponly=True)
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout")
def logout_user(token: str, response: Response):
    """
    Logs out the user by invalidating their JWT in FusionAuth.
    """

    fusionauth_base_url = os.getenv("FUSIONAUTH_BASE_URL")
    fusionauth_api_key = os.getenv("FUSIONAUTH_API_KEY")
    logout_url = f"{fusionauth_base_url}/api/jwt/logout"
    headers = {"Authorization": fusionauth_api_key, "Content-Type": "application/json"}
    payload = {"token": token}

    fusionauth_response = requests.post(logout_url, json=payload, headers=headers)

    if fusionauth_response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Logout failed: Unable to invalidate token."
        )

    # Clear authentication cookies
    response.delete_cookie(key="Authorization")
    return {"message": "Successfully logged out"}

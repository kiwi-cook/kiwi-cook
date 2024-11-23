import os
import re
from datetime import datetime, timezone

import requests
from dotenv import load_dotenv
from fastapi import APIRouter, Form, Response, Request
from fastapi import HTTPException, status

from fusionauth.fusionauth_client import FusionAuthClient

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
    request: Request, username: str = Form(...), password: str = Form(...)
):
    # Enhanced password validation
    if validate_password_complexity(password):
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 12 characters and include uppercase, lowercase, numbers, and special characters",
        )

    # Check username requirements
    if not re.match("^[a-zA-Z0-9_]{3,32}$", username):
        raise HTTPException(
            status_code=400,
            detail="Username must be 3-32 characters and contain only letters, numbers, and underscores",
        )

    # FusionAuth setup
    fusionauth_base_url = os.getenv("FUSIONAUTH_BASE_URL")
    fusionauth_api_key = os.getenv("FUSIONAUTH_API_KEY")
    client = FusionAuthClient(fusionauth_api_key, fusionauth_base_url)

    # Prepare registration payload
    registration_request = {
        "user": {
            "active": True,
            "password": password,
            "username": username,
        },
        "registration": {
            "applicationId": os.getenv("FUSIONAUTH_ID"),
        },
    }

    # Create user in FusionAuth
    client_response = client.create_user(registration_request)
    # Create a User
    if client_response.was_successful():
        logger.info(f"✨ User created: {username}")
        fusionauthUserId = client_response.success_response["user"]["id"]

        try:
            user = User(
                username=username,
                fusionauthUserId=fusionauthUserId,
                createdAt=datetime.now(timezone.utc).isoformat(),
            )

            # Insert user into MongoDB
            write_client["users"]["users"].insert_one(
                user.model_dump(by_alias=True, exclude_none=True)
            )
        except Exception as e:
            # Remove user from FusionAuth if creation failed
            client.delete_user(fusionauthUserId)
            logger.error(f"Failed to insert user into MongoDB: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Failed to create user",
            )

        return {"message": "User created successfully"}
    else:
        logger.error(f"Failed to create user: {client_response.error_response}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create user",
        )


@router.post("/login", status_code=status.HTTP_200_OK)
async def login_user(
    request: Request, username: str = Form(...), password: str = Form(...)
):
    # Input validation
    if not username or not password:
        raise HTTPException(
            status_code=400, detail="Username and password must be provided."
        )

    # FusionAuth setup
    fusionauth_base_url = os.getenv("FUSIONAUTH_BASE_URL")
    fusionauth_api_key = os.getenv("FUSIONAUTH_API_KEY")
    client = FusionAuthClient(fusionauth_api_key, fusionauth_base_url)

    # Prepare login payload
    login_request = {
        "loginId": username,
        "password": password,
    }

    # Authenticate user using FusionAuth
    client_response = client.login(login_request)

    if client_response.was_successful():
        logger.info(f"✨ User authenticated: {username}")

        # Retrieve access token from FusionAuth response
        access_token = client_response.success_response.get("token")
        refresh_token = client_response.success_response.get("refreshToken")

        # Set token as cookie for the client
        response = {"access_token": access_token, "token_type": "Bearer"}
        if refresh_token:
            response["refresh_token"] = refresh_token

        # Return access token and other info
        return response
    else:
        # Log failed authentication attempts
        logger.error(
            f"Failed login for user {username}: {client_response.error_response}"
        )
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout_user(token: str, response: Response):
    """
    Logs out the user by invalidating their JWT in FusionAuth.
    """

    # FusionAuth setup
    fusionauth_base_url = os.getenv("FUSIONAUTH_BASE_URL")
    fusionauth_api_key = os.getenv("FUSIONAUTH_API_KEY")
    client = FusionAuthClient(fusionauth_api_key, fusionauth_base_url)

    # Invalidate the token
    client_response = client.logout({"token": token})

    if not client_response.was_successful():
        error_details = client_response.error_response
        logger.error(f"Logout failed: {error_details}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Logout failed: Unable to invalidate token.",
        )

    # Clear authentication cookies
    response.delete_cookie(key="Authorization")
    return {"message": "Successfully logged out"}

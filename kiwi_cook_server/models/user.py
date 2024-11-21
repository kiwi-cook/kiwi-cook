import os
from datetime import datetime
from typing import Annotated, Optional

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status, Cookie
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, Field
from pymongo.collection import Collection
from starlette.requests import Request

import lib.password
from lib.database.mongodb import get_mongodb
from lib.logging import logger
from lib.token import TokenManager

load_dotenv()

SECRET_KEY = os.getenv("SECRET_JWT_KEY")
if not SECRET_KEY or len(SECRET_KEY) < 32:
    raise ValueError("SECRET_JWT_KEY must be set and at least 32 characters long")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/token")


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


# Enhanced Role-Based Access Control
class UserRole:
    GUEST = "guest"
    USER = "user"
    PAYING_USER = "paying_user"
    ADMIN = "admin"


class RoleBasedAccessControl:
    @staticmethod
    def require_role(required_roles):
        def role_checker(user: User):
            if not any(getattr(user, f"is_{role}", False) for role in required_roles):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Access denied. Required roles: {required_roles}"
                )
            return user

        return role_checker


class User(BaseModel):
    username: str
    disabled: bool = Field(default=False, description="User account status")
    paying_customer: bool = Field(default=False, description="Payment status")
    is_student: bool = Field(default=False, description="Student status")
    is_admin: bool = Field(default=False, description="Admin status")
    friends: list[str] = Field(default_factory=list)
    recipes: list[str] = Field(default_factory=list)
    weekplan: list[str] = Field(default_factory=list)


class UserInDB(User):
    hashed_password: str
    password_changed_at: datetime
    security_questions: list[str] = Field(default_factory=list)
    failed_login_attempts: int = Field(default=0)
    last_login_at: datetime | None = Field(default=None)


def get_user_collection() -> Collection:
    read_client = get_mongodb()
    return read_client["users"]["users"]


def get_user(username: str) -> UserInDB | None:
    user_collection = get_user_collection()
    user = user_collection.find_one({"username": username})
    if user is None:
        return None
    return UserInDB(**user)


def authenticate_user(username: str, password: str) -> UserInDB | bool:
    if not username or not password:
        return False
    user = get_user(username)
    if not user:
        return False
    if not lib.password.PasswordManager.verify_password(password, user.hashed_password):
        return False
    return user


async def get_current_user(
        request: Request,
        token: Optional[str] = Depends(OAuth2PasswordBearer(tokenUrl="token")),
        access_token_cookie: Optional[str] = Cookie(alias="access_token")
) -> UserInDB:
    # Multi-source token retrieval
    token = token or access_token_cookie or request.headers.get('Authorization')

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials missing"
        )

    # Decode and validate token
    try:
        payload = TokenManager.decode_token(token)
        username = payload.get("sub")

        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )

        user = get_user(username)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return user

    except HTTPException as e:
        raise e
    except Exception as e:
        # Log the unexpected error securely
        logger.error(f"Unexpected authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication system error"
        )


async def get_active_user(
        current_user: Annotated[UserInDB, Depends(get_current_user)]
) -> UserInDB:
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not active",
        )
    return current_user


async def get_paying_user(
        active_user: Annotated[User, Depends(get_active_user)]
) -> User:
    if not active_user.paying_customer:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="User is not a paying customer",
        )
    return active_user


async def get_admin_user(
        active_user: Annotated[User, Depends(get_active_user)]
) -> User:
    if not active_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not an admin",
        )
    return active_user

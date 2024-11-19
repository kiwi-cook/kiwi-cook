import os
from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status, Cookie
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from pydantic import BaseModel, Field
from pymongo.collection import Collection

from lib.auth import verify_password
from lib.database.mongodb import get_mongodb
from models.chat import ChatStateEnum

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


class User(BaseModel):
    username: str
    disabled: bool = Field(default=False, description="User account status")
    paying_customer: bool = Field(default=False, description="Payment status")
    is_student: bool = Field(default=False, description="Student status")
    is_admin: bool = Field(default=False, description="Admin status")
    friends: list[str] = Field(default_factory=list)
    recipes: list[str] = Field(default_factory=list)
    weekplan: list[str] = Field(default_factory=list)
    chat_state: str = Field(default=ChatStateEnum.not_started)

    def get_next_state(self):
        return ChatStateEnum.get_next_of(self.chat_state)

    def set_next_state(self):
        self.chat_state = ChatStateEnum.get_next_of(self.chat_state)
        return self.chat_state

    def set_previous_state(self):
        self.chat_state = ChatStateEnum.get_previous_of(self.chat_state)
        return self.chat_state


class UserInDB(User):
    hashed_password: str


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
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    
    # Ensure expires_delta is a timedelta, default to 15 minutes if None
    if expires_delta is None:
        expires_delta = timedelta(minutes=15)
    
    # Set the expiration time
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(
    token: Annotated[str | None, Depends(oauth2_scheme)] = None,
    access_token_cookie: Annotated[str | None, Cookie(alias="access_token")] = None,
) -> UserInDB:
    if token is None:
        token = access_token_cookie  # Fall back to the token from the cookie

    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
            )
        token_data = TokenData(username=username)
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired"
        )
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )

    user = get_user(username=token_data.username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )
    return user



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

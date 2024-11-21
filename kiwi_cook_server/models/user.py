from dotenv import load_dotenv
from pydantic import BaseModel, Field
from pymongo.collection import Collection

from lib.database.mongodb import get_mongodb

load_dotenv()


class User(BaseModel):
    username: str
    fusionauthUserId: str
    createdAt: str

    friends: list[str] = Field(default_factory=list)
    recipes: list[str] = Field(default_factory=list)
    weekplan: list[str] = Field(default_factory=list)


def get_user_collection() -> Collection:
    read_client = get_mongodb()
    return read_client["users"]["users"]


def get_user(username: str) -> User | None:
    user_collection = get_user_collection()
    user = user_collection.find_one({"username": username})
    if user is None:
        return None
    return User(**user)

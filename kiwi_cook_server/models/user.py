from typing import List

from dotenv import load_dotenv
from pydantic import BaseModel
from pymongo.collection import Collection

from lib.database.mongodb import get_mongodb

load_dotenv()


class PublicUser(BaseModel):
    username: str
    createdAt: str

    friends: List[str]
    recipes: List[str]
    weekplan: List[str]


class User(PublicUser):
    fusionauthUserId: str


def get_user_collection() -> Collection:
    read_client = get_mongodb()
    return read_client["users"]["users"]


def get_user(username: str) -> PublicUser:
    user_collection = get_user_collection()
    user = user_collection.find_one({"username": username})
    if user is None:
        return None
    return User(**user)

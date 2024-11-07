import os
from typing import Any, Mapping

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.server_api import ServerApi

from lib.logging import logger

_clients = {}

load_dotenv()


def get_database(rights: str = "READ") -> MongoClient[Mapping[str, Any] | Any]:
    global _clients
    if rights in _clients:
        return _clients[rights]
    _MONGO_URI = os.getenv("MONGO_URI_" + rights)
    if _MONGO_URI is None:
        raise ValueError(f"MongoDB URI for rights {rights} is not set")
    client = MongoClient(_MONGO_URI, server_api=ServerApi("1"))
    client.admin.command("ping")
    logger.info("Connected to MongoDB")

    _clients[rights] = client
    return client

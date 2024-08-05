from typing import Any, Mapping

from pymongo import MongoClient


def get_database() -> MongoClient[Mapping[str, Any] | Any]:
    url = 'mongodb://root:example@localhost:27017/'
    client = MongoClient(url)
    return client

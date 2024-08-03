import os
from typing import Any, Mapping

import certifi
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.server_api import ServerApi


def get_database() -> MongoClient[Mapping[str, Any] | Any]:
    url = 'mongodb://root:example@localhost:27017/'
    client = MongoClient(url)
    return client

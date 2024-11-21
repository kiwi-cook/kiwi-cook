import os

import redis
from dotenv import load_dotenv

from lib.logging import logger

load_dotenv()

_redis = None
_redis_uri = os.getenv("REDIS_HOST", "localhost")
_redis_port = int(os.getenv("REDIS_PORT", 6379))


def get_redis() -> redis.Redis:
    global _redis
    if _redis is None:
        try:
            _redis = redis.Redis(host=_redis_uri, port=_redis_port, db=0)
            # Test the connection
            _redis.ping()
            logger.info("Connected to Redis")
        except redis.ConnectionError as e:
            raise RuntimeError(f"Failed to connect to Redis at {_redis_uri}:{_redis_port}") from e
    return _redis

import os

from dotenv import load_dotenv
import redis.asyncio as redis

load_dotenv()

_redis_uri = os.getenv("REDIS_HOST")
_redis_port = os.getenv("REDIS_PORT")

def get_redis_uri() -> str:
    return "redis://" + _redis_uri + ":" + _redis_port

async def get_redis() -> redis.Redis:
    return redis.Redis(host=_redis_uri, port=_redis_port, decode_responses=True)
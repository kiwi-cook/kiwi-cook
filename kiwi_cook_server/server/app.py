import os
import re
from typing import List

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

from lib.logging import logger
from models.api import APIResponse

load_dotenv()


def get_environment() -> str:
    env = os.getenv("ENV", "production").lower()
    if env not in ("development", "production"):
        raise ValueError(f"Invalid environment: {env}")
    return env


ENV = get_environment()


def setup_fastapi() -> FastAPI:
    logger.info(f"Setting up FastAPI for {ENV} mode...")
    return FastAPI(
        title="KiwiCook",
        description="The Student-Friendly Recipe Suggestion App: Crafted by Students, for Students",
        version="0.2.0",
        docs_url="/docs" if ENV == "development" else None,
        redoc_url=None,
        openapi_url="/openapi.json" if ENV == "development" else None,
    )


DEV_ORIGINS = ["http://localhost", "http://127.0.0.1"]
PROD_ORIGINS = [
    os.getenv("PROD_ORIGIN_1", "https://kiwi-cook.github.io"),
    os.getenv("PROD_ORIGIN_2", "https://kiwi.jpkmiller.de"),
    os.getenv("PROD_ORIGIN_3", "https://taste-buddy.uk"),
]

def get_allowed_origins() -> List[str]:
    """Returns the list of allowed origins based on the environment.

    Returns:
        List[str]: A list of allowed origin URLs for CORS.
    """
    return DEV_ORIGINS if ENV == "development" else PROD_ORIGINS

def generate_allow_origin_regex(origins: List[str]) -> str:
    """Generates a regex pattern from the list of allowed origins.

    Args:
        origins (List[str]): A list of origin URLs.

    Returns:
        str: A regex pattern that matches the allowed origins.
    """
    # Extract and escape domain names
    domains = [re.escape(origin.split("://")[1].split(":")[0]) for origin in origins]
    # Construct a regex pattern
    return r"^https?://(" + "|".join(domains) + r")(:[0-9]+)?$"

def setup_rate_limiting(app: FastAPI) -> None:
    if ENV != "production":
        return

    from lib.database.redis import get_redis    
    redis = get_redis()

    from fastapi_limiter import FastAPILimiter
    from fastapi_limiter.depends import RateLimiter
    FastAPILimiter.init(redis)

    @app.middleware("http")
    async def rate_limit_middleware(request: Request, call_next):
        rate_limiter = RateLimiter(request=request, key_func=lambda: request.client.host)
        limit, key = await rate_limiter.get()
        if limit.remaining:
            response = await call_next(request)
            await rate_limiter.incr()
            return response
        return JSONResponse(content={"error": True, "response": "Rate limit exceeded"}, status_code=429)

def setup_cors(app: FastAPI) -> None:
    """Configures Cross-Origin Resource Sharing (CORS) for the FastAPI app.

    Args:
        app (FastAPI): The FastAPI application instance.
    """
    allowed_origins = get_allowed_origins()
    allow_origin_regex = generate_allow_origin_regex(allowed_origins)

    logger.info("Setting up CORS for %s mode with allowed origins: %s", ENV, allowed_origins)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_origin_regex=allow_origin_regex,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=[
            "Authorization",
            "Content-Type",
            "Origin",
            "Accept",
            "X-Requested-With",
        ],
        expose_headers=["Content-Type"],
        max_age=600,
    )
    logger.info("CORS setup complete with regex: %s", allow_origin_regex)


def setup_log_request_headers(app: FastAPI) -> None:
    async def log_request_headers(request: Request, call_next):
        headers_to_log = {key: value for key, value in request.headers.items() if key.lower() != "authorization"}
        logger.info(f"Request headers (filtered): {headers_to_log}")
        response = await call_next(request)
        return response

    app.middleware("http")(log_request_headers)


def setup_routes(app: FastAPI) -> None:
    from server.routers import chatgpt, recipe
    from server.routers.user import user

    app.include_router(recipe.router)
    app.include_router(chatgpt.router)
    app.include_router(user.router)

    @app.get(
        "/",
        response_description="Root endpoint",
        response_model=APIResponse[str],
        response_model_by_alias=False,
        response_model_exclude_none=True,
        summary="Root endpoint",
    )
    def read_root():
        return {"error": False, "response": "Welcome to KiwiCook!"}

    @app.get(
        "/health", response_description="Health check", response_model=APIResponse[str]
    )
    def health_check():
        return JSONResponse(content={"error": False, "response": "OK"}, status_code=200)


def setup_exception_handlers(app: FastAPI) -> None:
    async def not_found(request, exc):
        return JSONResponse(content={"error": True, "response": "Not Found"}, status_code=404)

    async def server_error(request, exc):
        return JSONResponse(content={"error": True, "response": "Internal Server Error"}, status_code=500)

    exception_handlers = {
        404: not_found,
        500: server_error,
        503: server_error,
    }

    app.exception_handlers = exception_handlers


def setup_trusted_host(app: FastAPI) -> None:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=[
            "kiwi-cook.uk",
            "taste-buddy.uk",
            "*.taste-buddy.uk",
            "kiwi-cook:8000",
            "localhost",
            "localhost:8000",
            "127.0.0.1",
            "127.0.0.1:8000",
            "0.0.0.0",
            "0.0.0.0:8000",
        ],
    )


app = setup_fastapi()
setup_trusted_host(app)
setup_cors(app)
setup_routes(app)
setup_rate_limiting(app)
setup_exception_handlers(app)
setup_log_request_headers(app)

try:
    from lib.database.mongodb import get_mongodb

    get_mongodb()
except Exception as e:
    logger.error("Database connection failed.")
    raise


def start_server() -> None:
    logger.info(f"Starting server in {ENV} mode...")
    uvicorn.run(
        "server.app:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=ENV == "development",
        workers=1 if ENV == "development" else None,
        log_level="info",
    )


if __name__ == "__main__":
    start_server()

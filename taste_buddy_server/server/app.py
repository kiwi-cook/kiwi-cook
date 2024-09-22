import logging
import os
from logging.config import dictConfig
from typing import Literal

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from starlette.responses import JSONResponse

from database.mongodb import get_database
from models.api import APIResponse
from server.limit import limiter, rate_limit_exceeded_handler
from server.routers import chatgpt, recipe, user

# Configure logging
logging_config = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "()": "uvicorn.logging.DefaultFormatter",
            "fmt": "%(levelprefix)s %(message)s",
            "use_colors": None,
        },
    },
    "handlers": {
        "default": {
            "formatter": "default",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stderr",
        },
    },
    "loggers": {
        "tastebuddy": {"handlers": ["default"], "level": "INFO"},
    },
}
dictConfig(logging_config)
logger = logging.getLogger("tastebuddy")

load_dotenv()


def get_environment() -> Literal["development", "production"]:
    env = os.getenv("ENV", "production").lower()
    if env not in ("development", "production"):
        raise ValueError(f"Invalid environment: {env}")
    return env


ENV = get_environment()


def setup_fastapi() -> FastAPI:
    logger.info(f"Setting up FastAPI for {ENV} mode...")
    return FastAPI(
        title="Taste Buddy",
        description="The Student-Friendly Recipe Suggestion App: Crafted by Students, for Students",
        version="0.2.0",
        docs_url="/docs" if ENV == "development" else None,
        redoc_url=None,
        openapi_url="/openapi.json" if ENV == "development" else None,
    )


def setup_cors(app: FastAPI) -> None:
    logger.info(f"Setting up CORS for {ENV} mode...")

    if ENV == "development":
        origins = [
            "http://localhost",
            "http://127.0.0.1",
        ]
        allow_origin_regex = r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$"
    else:
        origins = ["https://taste-buddy.github.io"]
        allow_origin_regex = r"https://.*\.taste-buddy\.uk"

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_origin_regex=allow_origin_regex,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
    )


def setup_routes(app: FastAPI) -> None:
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
        return {"error": False, "response": "Welcome to Taste Buddy!"}

    @app.get(
        "/health", response_description="Health check", response_model=APIResponse[str]
    )
    def health_check():
        return {"error": False, "response": "OK"}


app = setup_fastapi()
setup_cors(app)
setup_routes(app)

try:
    client = get_database()
except Exception as e:
    logger.error(f"Failed to connect to database: {str(e)}")
    raise

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# Trusted Host Middleware
app.add_middleware(
    TrustedHostMiddleware, allowed_hosts=["taste-buddy.uk", "localhost", "127.0.0.1"]
)


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

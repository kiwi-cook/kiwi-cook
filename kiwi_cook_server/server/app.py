import os
import uuid

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from lib.logging import logger
from models.api import APIResponse
from server.security import initialize_security_measures

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
        title="KiwiCook API",
        description="",
        version="0.3.0",
        docs_url="/docs" if ENV == "development" else None,
        redoc_url=None,
        openapi_url="/openapi.json" if ENV == "development" else None,
    )


def setup_log_request_headers(app: FastAPI) -> None:
    async def log_request_headers(request: Request, call_next):
        headers_to_log = {
            key: value
            for key, value in request.headers.items()
            if key.lower() != "authorization"
        }
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
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        # Log the full error details internally
        logger.error(f"Unhandled exception: {exc}", exc_info=True)

        # Sanitized error response
        return JSONResponse(
            status_code=500,
            content={
                "error": True,
                "message": "An unexpected error occurred",
                "request_id": str(uuid.uuid4()),
            },
        )


app = setup_fastapi()
initialize_security_measures(app)
setup_routes(app)
setup_exception_handlers(app)
setup_log_request_headers(app)

try:
    from lib.database.mongodb import get_mongodb

    get_mongodb()
except Exception as e:
    logger.error(e)
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

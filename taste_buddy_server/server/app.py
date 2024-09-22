import os

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from database.mongodb import get_database
from models.api import APIResponse
from server.routers import chatgpt, recipe, user

load_dotenv()
ENV = os.getenv("ENV") or "production"


def setup_fastapi():
    print(
        f"Setting up FastAPI for {'development' if ENV == 'development' else 'production'} mode..."
    )
    return FastAPI(
        title="Taste Buddy",
        description="The Student-Friendly Recipe Suggestion App: Crafted by Students, for Students",
        version="0.2.0",
        docs_url="/docs" if ENV == "development" else None,
        redoc_url=None,
        openapi_url="/openapi.json" if ENV == "development" else None,
    )


def setup_cors(app: FastAPI):
    print(
        f"Setting up CORS for {'development' if ENV == 'development' else 'production'} mode..."
    )

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
        allow_methods=["*"],
        allow_headers=["*"],
    )


def setup_routes(app: FastAPI):
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
client = get_database()


def start_server():
    print(
        f"Starting server in {'development' if ENV == 'development' else 'production'} mode..."
    )
    uvicorn.run(
        "server.app:app",
        host="0.0.0.0",
        port=8000,
        reload=ENV,
        workers=1 if ENV == "development" else None,
        log_level="debug" if ENV == "development" else "info",
    )


if __name__ == "__main__":
    print(
        f"Starting server in {'development' if ENV == 'development' else 'production'} mode..."
    )

    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=ENV,
        workers=1 if ENV == "development" else None,
        log_level="debug" if ENV == "development" else "info",
    )

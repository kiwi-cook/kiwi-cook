import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from database.mongodb import get_database
from models.api import APIResponse
from server.routers import ingredient, chatgpt, recipe, user

load_dotenv()

app = FastAPI(
    title="Taste Buddy",
    description="The Student-Friendly Recipe Suggestion App: Crafted by Students, for Students",
    version="0.2.0",
    redoc_url=None,
)

origins = [
    "http://localhost:8080",
    "http://localhost:8100",
    "https://taste-buddy.github.io",
    "https://taste-buddy.uk",
    "https://api.taste-buddy.uk",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(recipe.router)
app.include_router(ingredient.router)
app.include_router(chatgpt.router)
app.include_router(user.router)

client = get_database()


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


def start_server(reload=False):
    print("Starting server...")
    uvicorn.run("server.app:app", host="0.0.0.0", port=8000, reload=reload)


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from database.mongodb import get_database
from server.routers import recipes
from server.routers import ingredients

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
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "HEAD"],
    allow_headers=["*"],
)
app.include_router(recipes.router)
app.include_router(ingredients.router)

client = get_database()


@app.get("/")
def read_root():
    return {"message": "Hello from Taste Buddy!"}


def start_server():
    print("Starting server...")
    uvicorn.run("server.app:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)

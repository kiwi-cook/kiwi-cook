from fastapi import FastAPI
from dotenv import load_dotenv
from starlette import status
from starlette.middleware.cors import CORSMiddleware

from models.api import APIResponse, APIResponseList
from models.item import Item
from models.recipe import Recipe
from mongodb import get_database

load_dotenv()

app = FastAPI(title="Taste Buddy",
              description="The Student-Friendly Recipe Suggestion App: Crafted by Students, for Students",
              version="0.1.0",
              redoc_url=None, debug=False)
origins = [
    "http://localhost:8080"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = get_database()


@app.get("/")
def read_root():
    return "Hello from Taste Buddy!"


@app.post("/recipe/",
          response_description="Add new recipes",
          response_model=APIResponse,
          status_code=status.HTTP_201_CREATED,
          response_model_by_alias=False,
          response_model_exclude_none=True,
          )
def create_recipes(recipe: list[Recipe]):
    return {"error": False, "response": client['recipes'].insert_many(recipe)}


@app.put("/recipe/",
         response_description="Update recipes",
         response_model=APIResponse,
         status_code=status.HTTP_201_CREATED,
         response_model_by_alias=False,
         response_model_exclude_none=True,
         )
def update_recipes(recipe: list[Recipe]):
    return {"error": False, "response": client['recipes'].insert_many(recipe)}


@app.get("/recipe/",
         response_description="Get all recipes",
         response_model=APIResponse,
         response_model_by_alias=False,
         response_model_exclude_none=True,
         )
def read_recipes():
    return {"error": False, "response": list(client['recipes'].find())}


@app.post("/recipes/parse/",
          response_description="Parse recipes using a specified parser",
          status_code=status.HTTP_201_CREATED,
          response_model_by_alias=False,
          )
def parse_recipes():
    # TODO document why this method is empty
    pass


@app.get("/item",
         response_description="Get all items",
         response_model=APIResponseList[Item],
         response_model_by_alias=False,
         response_model_exclude_none=True,
         )
def read_recipes():
    return {"error": False, "response": list(client['items'].find())}

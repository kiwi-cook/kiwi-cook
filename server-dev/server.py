from fastapi import FastAPI
from dotenv import load_dotenv
from starlette import status
from starlette.middleware.cors import CORSMiddleware

from models.api import APIResponseList
from models.item import Item
from models.recipe import Recipe
from mongodb import get_database
from scraper import scrape_parse_convert

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
          response_model=APIResponseList[str],
          status_code=status.HTTP_201_CREATED,
          response_model_by_alias=False,
          response_model_exclude_none=True,
          )
def create_recipes(recipes: list[Recipe]):
    error = False
    inserted_recipes = client['recipes'].insert_many(
        [recipe.model_dump(by_alias=True, exclude_none=True) for recipe in recipes])
    if len(inserted_recipes.inserted_ids) != len(recipes):
        error = True
    inserted_ids = [str(recipeId) for recipeId in inserted_recipes.inserted_ids]
    return {"error": error, "response": inserted_ids}


@app.post("/recipe/parse",
          response_description="Parse recipes from URLs",
          response_model=APIResponseList[str],
          status_code=status.HTTP_201_CREATED,
          response_model_by_alias=False,
          response_model_exclude_none=True,
          )
def parse_recipes(recipe_urls: list[str]):
    error = False
    parsed_recipes = []
    for url in recipe_urls:
        recipe = scrape_parse_convert(url, client)
        parsed_recipes.append(recipe)
    inserted_recipes = client['recipes'].insert_many(
        [recipe.model_dump(by_alias=True, exclude_none=True) for recipe in parsed_recipes])
    if len(inserted_recipes.inserted_ids) != len(recipe_urls):
        error = True
    inserted_ids = [str(recipeId) for recipeId in inserted_recipes.inserted_ids]
    return {"error": error, "response": inserted_ids}


@app.get("/recipe/",
         response_description="Get all recipes",
         response_model=APIResponseList[Recipe],
         response_model_by_alias=False,
         response_model_exclude_none=True,
         )
def read_recipes():
    return {"error": False, "response": list(client['recipes'].find())}


@app.get("/item",
         response_description="Get all items",
         response_model=APIResponseList[Item],
         response_model_by_alias=False,
         response_model_exclude_none=True,
         )
def read_recipes():
    return {"error": False, "response": list(client['items'].find())}

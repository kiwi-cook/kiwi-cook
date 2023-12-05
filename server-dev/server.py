from fastapi import FastAPI
from dotenv import load_dotenv
from starlette import status

from models.recipe import Recipe
from mongodb import get_database

load_dotenv()

app = FastAPI(title="Taste Buddy", description="A recipe recommendation API", version="0.1.0",
              redoc_url=None, debug=False)
client = get_database()


@app.get("/")
def read_root():
    return "Hello from Taste Buddy!"


@app.post("/recipes/",
          response_description="Add new recipes",
          response_model=Recipe,
          status_code=status.HTTP_201_CREATED,
          response_model_by_alias=False,
          )
def create_recipes(recipe: list[Recipe]):
    return client['recipes'].insert_many(recipe)


@app.put("/recipes/",
         response_description="Update recipes",
         response_model=Recipe,
         status_code=status.HTTP_201_CREATED,
         response_model_by_alias=False,
         )
def update_recipes(recipe: list[Recipe]):
    return client['recipes'].insert_many(recipe)


@app.get("/recipes/",
         response_description="Get all recipes",
         response_model=list[Recipe],
         response_model_by_alias=False,
         )
def read_recipes():
    return list(client['recipes'].find())


@app.post("/recipes/parse/",
          response_description="Parse recipes using a specified parser",
          status_code=status.HTTP_201_CREATED,
          response_model_by_alias=False,
          )
def parse_recipes():
    # TODO document why this method is empty
    pass

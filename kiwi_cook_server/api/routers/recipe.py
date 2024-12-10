import logging

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pymongo.errors import PyMongoError
from starlette import status

from lib.database.mongodb import get_mongodb
from lib.scraper.scraper import parse_recipe, upsert_recipe
from lib.telemetry.exporter import service_tracer
from models.api import APIResponseList
from models.recipe import Recipe

router = APIRouter(prefix="/recipe", tags=["recipes"])

logger = logging.getLogger(__name__)

tracer = service_tracer


@router.get(
    "/",
    response_description="Get all recipes",
    response_model=APIResponseList[Recipe],
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
async def get_recipes():
    with tracer.start_as_current_span("read_recipes"):
        try:
            read_mongo_client = get_mongodb()
            recipes = list(read_mongo_client["recipes"]["recipes"].find())
            if recipes and len(recipes) > 0:
                return {"error": False, "response": recipes}

            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"error": True, "response": "No recipes found"},
            )
        except PyMongoError as e:
            logger.error(f"Database error: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"error": True, "response": "Database error"}
            )


@router.post(
    "/url",
    response_description="Parse a recipe from a URL",
    response_model=APIResponseList[Recipe],
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
async def parse_recipe_from_url(url: str):
    with tracer.start_as_current_span("parse_recipe"):
        try:
            recipe = parse_recipe(url)
            if recipe:
                upsert_recipe(recipe)
                return {"error": False, "response": [recipe]}

            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"error": True, "response": "No recipe found"},
            )
        except Exception as e:
            logger.error(f"Error parsing recipe: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"error": True, "response": "Error parsing recipe"}
            )

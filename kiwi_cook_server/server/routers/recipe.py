import logging
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from pymongo.errors import PyMongoError
from starlette import status
from typing_extensions import Annotated

from lib.database.mongodb import get_mongodb
from lib.pipeline.recipe import run_html_pipeline
from models.api import APIResponseList
from models.recipe import Recipe
from models.user import User, get_active_user

router = APIRouter(prefix="/recipe", tags=["recipes"])

logger = logging.getLogger(__name__)

_recipes = []


@router.get(
    "/",
    response_description="Get all recipes",
    response_model=APIResponseList[Recipe],
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
async def read_recipes():
    global _recipes
    try:
        if _recipes and len(_recipes) > 0:
            return {"error": False, "response": _recipes}

        read_client = get_mongodb()
        recipes = list(read_client["recipes"]["recipes"].find())
        if not recipes:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"error": True, "detail": "No recipes found"},
            )
        _recipes = recipes
        return {"error": False, "response": recipes}
    except PyMongoError as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


def validate_url(_url: str) -> bool:
    try:
        result = urlparse(_url)
        return all([result.scheme, result.netloc])
    except ValueError:
        return False


@router.post(
    "/add/url",
    response_description="Add a list of recipes from URLs",
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_201_CREATED,
)
async def add_recipes(
        current_user: Annotated[User, Depends(get_active_user)],
        urls: list[str] = Query(..., max_length=10),
):
    if not urls:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No URLs provided"
        )

    valid_urls = [url for url in urls if validate_url(url)]
    if not valid_urls:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No valid URLs provided"
        )

    try:
        processed_urls = await run_html_pipeline(valid_urls)
        return {
            "error": False,
            "response": f"{len(processed_urls)} recipes added to the database.",
        }
    except ValueError as e:
        logger.error(f"Value error in pipeline: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid input data"
        )
    except Exception as e:
        logger.error(f"Unexpected error in pipeline: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )

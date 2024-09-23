import logging
from urllib.parse import urlparse

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from pymongo.errors import PyMongoError
from starlette import status
from typing_extensions import Annotated

from lib.database.mongodb import get_database
from models.api import APIResponseList
from models.recipe import Recipe
from models.user import User, get_active_user
from pipeline.recipe.__init__ import run_pipeline

router = APIRouter(prefix="/recipe", tags=["recipes"])

logger = logging.getLogger(__name__)


def validate_object_id(_id: str) -> bool:
    return ObjectId.is_valid(_id)


def validate_url(_url: str) -> bool:
    try:
        result = urlparse(_url)
        return all([result.scheme, result.netloc])
    except ValueError:
        return False


@router.get(
    "/",
    response_description="Get all recipes",
    response_model=APIResponseList[Recipe],
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
async def read_recipes(limit: int = Query(50, ge=1, le=100)):
    try:
        read_client = get_database()
        recipes = list(read_client["recipes"]["recipes"].find().limit(limit))
        if not recipes:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"error": True, "detail": "No recipes found"},
            )
        return {"error": False, "response": recipes}
    except PyMongoError as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


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
        processed_urls = await run_pipeline(valid_urls)
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

import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pymongo.errors import PyMongoError
from starlette import status

from lib.database.mongodb import get_mongodb
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
            read_client = get_mongodb()
            recipes = list(read_client["recipes"]["recipes"].find())
            if recipes and len(recipes) > 0:
                return {"error": False, "response": recipes}

            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"error": True, "detail": "No recipes found"},
            )
        except PyMongoError as e:
            logger.error(f"Database error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error",
            )

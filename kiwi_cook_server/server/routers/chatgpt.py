import logging
from typing import Annotated

from fastapi import APIRouter, UploadFile, Depends, HTTPException, File
from pydantic import BaseModel, conlist

from lib.chatgpt.ingredients import find_ingredients_in_image
from lib.chatgpt.weekplan import generate_weekplan_from_ingredients_image
from models.api import APIResponseList
from models.user import User, get_paying_user

router = APIRouter(
    prefix="/chatgpt",
    tags=["chatgpt"],
    include_in_schema=False,
)

logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}


class IngredientsRequest(BaseModel):
    ingredients: conlist(str, max_length=100, min_length=1)


def validate_image(file: UploadFile) -> None:
    if file.content_type not in [f"image/{ext}" for ext in ALLOWED_EXTENSIONS]:
        raise HTTPException(status_code=400, detail="Invalid file type")

    file.file.seek(0, 2)
    if file.file.tell() > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large")
    file.file.seek(0)


@router.post(
    "/ingredient/image",
    response_description="Find ingredients in the image",
    response_model=APIResponseList[str],
    response_model_by_alias=False,
    response_model_exclude_none=True,
)
async def analyze_ingredient_image(
        current_user: Annotated[User, Depends(get_paying_user)],
        image: UploadFile = File(...),
):
    validate_image(image)

    try:
        contents = await image.read()
        ingredients_list = find_ingredients_in_image(contents)
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing the image")

    if ingredients_list is None:
        raise HTTPException(status_code=500, detail="Error processing the image")

    return {"error": False, "response": ingredients_list}


@router.post(
    "/weekplan",
    response_description="Generate a week plan based on the ingredients list and image",
    response_model=APIResponseList[str],
    response_model_by_alias=False,
    response_model_exclude_none=True,
)
async def generate_weekplan(
        current_user: Annotated[User, Depends(get_paying_user)],
        ingredients: IngredientsRequest = None,
        image: UploadFile = File(None),
):
    if ingredients is None and image is None:
        raise HTTPException(status_code=400, detail="No ingredients or image provided")

    if image:
        validate_image(image)

    try:
        ingredients_list = ingredients.ingredients if ingredients else []
        response = generate_weekplan_from_ingredients_image(ingredients_list, image)
    except Exception as e:
        logger.error(f"Error generating weekplan: {str(e)}")
        raise HTTPException(status_code=500, detail="Error generating the weekplan")

    if not response:
        raise HTTPException(status_code=500, detail="Error generating the weekplan")

    return {"error": False, "response": response}

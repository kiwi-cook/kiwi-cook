from typing import Annotated

from fastapi import APIRouter, UploadFile, Depends, Response
from fastapi.security import OAuth2PasswordBearer
from starlette import status

from chatgpt.ingredients import find_ingredients_in_image
from chatgpt.weekplan import generate_weekplan_from_ingredients_image
from models.api import APIResponseList
from models.user import User, get_current_active_user

router = APIRouter(
    prefix="/chatgpt",
    tags=["chatgpt"],
    include_in_schema=False,
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


@router.post(
    "/ingredient/image",
    response_description="Find ingredients in the image",
    response_model=APIResponseList[str],
    response_model_by_alias=False,
    response_model_exclude_none=True,
)
async def analyze_ingredient_image(
    response: Response,
    current_user: Annotated[User, Depends(get_current_active_user)],
    image: UploadFile | None = None,
):

    if not current_user.paying_customer:
        response.status_code = status.HTTP_402_PAYMENT_REQUIRED
        return {"error": True, "response": "User is not a paying customer"}

    if image is None:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"error": True, "response": "No image provided"}

    contents = await image.read()
    ingredients_list = find_ingredients_in_image(contents)

    if ingredients_list is None:
        return {"error": True, "response": "Error processing the image"}

    return {"error": False, "response": ingredients_list}


@router.post(
    "/weekplan",
    response_description="Generate a week plan based on the ingredients list and image",
    response_model=APIResponseList[str],
    response_model_by_alias=False,
    response_model_exclude_none=True,
)
async def generate_weekplan(
    current_user: Annotated[User, Depends(get_current_active_user)],
    response: Response,
    ingredients_list=None,
    image: UploadFile | None = None,
):

    if not current_user.paying_customer:
        response.status_code = status.HTTP_402_PAYMENT_REQUIRED
        return {"error": True, "response": "User is not a paying customer"}

    if ingredients_list is None:
        ingredients_list = []
    if not ingredients_list and not image:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"error": True, "response": "No ingredients or image provided"}

    response = generate_weekplan_from_ingredients_image(ingredients_list, image)

    if not response:
        return {"error": True, "response": "Error generating the weekplan"}

    return {"error": False, "response": response}

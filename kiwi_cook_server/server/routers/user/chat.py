from typing import Annotated

from fastapi import APIRouter, Depends
from starlette import status
from starlette.responses import Response

from models.api import APIResponseList, APIResponse
from models.chat import ChatStateEnum
from models.user import User, get_paying_user, get_active_user

router = APIRouter(
    prefix="/users/chat",
    tags=["users"],
)


@router.get(
    "/state/current",
    response_description="Get the current chat state of the user",
    response_model=APIResponse[ChatStateEnum],
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
async def get_state(
    current_user: Annotated[User, Depends(get_active_user)],
    response: Response,
):
    current_state = current_user.chat_state
    next_state = current_user.get_next_state()
    return {
        "error": False,
        "response": {
            "current_state": current_state,
            "next_state": next_state,
        },
    }


@router.post(
    "/state/next",
    response_description="Set the next chat state of the user",
    response_model=APIResponse[ChatStateEnum],
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
async def set_next_state(
    current_user: Annotated[User, Depends(get_active_user)],
    response: Response,
):
    previous_state = current_user.chat_state
    current_state = current_user.set_next_state()
    return {
        "error": False,
        "response": {
            "previous_state": previous_state,
            "current_state": current_state,
        },
    }


@router.post(
    "/state/previous",
    response_description="Set the previous chat state of the user",
    response_model=APIResponse[ChatStateEnum],
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
async def set_previous_state(
    current_user: Annotated[User, Depends(get_active_user)],
    response: Response,
):
    previous_state = current_user.chat_state
    current_state = current_user.set_previous_state()
    return {
        "error": False,
        "response": {
            "previous_state": previous_state,
            "current_state": current_state,
        },
    }


@router.post(
    "/",
    response_description="Chat with the server",
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
async def suggest_user_recipes(
    current_user: Annotated[User, Depends(get_active_user)],
    response: Response,
):
    pass


@router.post(
    "/suggest",
    response_description="Get recipe suggestions for the current user",
    response_model=APIResponseList[str],
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
async def suggest_user_recipes(
    current_user: Annotated[User, Depends(get_active_user)],
    response: Response,
):
    pass


@router.get(
    "/weekplan/",
    response_description="Get the week plan of the current user",
    response_model=APIResponseList[str],
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
async def read_user_weekplan(
    current_user: Annotated[User, Depends(get_active_user)],
    response: Response,
):
    return {"error": False, "response": current_user.weekplan or []}


@router.post(
    "/weekplan/generate",
    response_description="Generate a weekplan for the current user",
    response_model=APIResponseList[str],
    response_model_by_alias=False,
    response_model_exclude_none=True,
    status_code=status.HTTP_200_OK,
)
async def read_user_weekplan(
    current_user: Annotated[User, Depends(get_paying_user)],
    response: Response,
):
    return {"error": False, "response": current_user.weekplan or []}

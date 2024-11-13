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

from typing import Annotated

from bson import ObjectId as _ObjectId
from pydantic import BeforeValidator, AfterValidator


def check_object_id(value: str) -> str:
    if not _ObjectId.is_valid(value):
        raise ValueError("Invalid ObjectId")
    return value


PyObjectId = Annotated[str, AfterValidator(check_object_id), BeforeValidator(str)]

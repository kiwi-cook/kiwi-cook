from typing import Annotated

from pydantic import (BeforeValidator, AfterValidator)
from bson import ObjectId as _ObjectId


def check_object_id(value: str) -> str:
    if not _ObjectId.is_valid(value):
        raise ValueError('Invalid ObjectId')
    return value


PyObjectId = Annotated[str, AfterValidator(check_object_id), BeforeValidator(str)]

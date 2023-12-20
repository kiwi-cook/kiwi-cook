from typing import List, TypeVar, Generic

from pydantic import Field, BaseModel
from pydantic.generics import GenericModel

T = TypeVar('T', bound=BaseModel)


class GenericAPIResponse(GenericModel, Generic[T]):
    object: T


class GenericAPIResponseList(GenericModel, Generic[T]):
    objects: list[T]


class BaseAPIResponse(GenericModel):
    error: bool = Field(alias="error", default=False)


class APIResponse(BaseAPIResponse, Generic[T]):
    response: T = Field(alias="response", default=[])


class APIResponseList(BaseAPIResponse, Generic[T]):
    response: List[T] | str = Field(alias="response", default=[])

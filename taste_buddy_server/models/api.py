from typing import List, TypeVar, Generic

from pydantic import Field, BaseModel

T = TypeVar("T", bound=BaseModel)


class BaseAPIResponse(BaseModel):
    error: bool = Field(alias="error", default=False)


class APIResponse(BaseAPIResponse, Generic[T]):
    response: T = Field(alias="response", default=[])


class APIResponseList(BaseAPIResponse, Generic[T]):
    response: List[T] | str = Field(alias="response", default=[])

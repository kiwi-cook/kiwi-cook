from typing import List
from pydantic import BaseModel, Field


class LocalizedString(BaseModel):
    lang: str
    value: str


class Author(BaseModel):
    name: str
    url: str


class CookBook(BaseModel):
    name: str
    url: str
    publisher: str


class Source(BaseModel):
    url: str
    authors: List[Author]
    copyright: str
    cookBook: CookBook


class StepItem(BaseModel):
    id: str = Field(alias="_id", default=None)
    quantity: float
    unit: str


class Step(BaseModel):
    desc: LocalizedString
    items: List[StepItem] = []
    imgUrl: str = None
    duration: int = None
    temperature: float = None


class Recipe(BaseModel):
    id: str = Field(alias="_id", default=None)
    name: LocalizedString
    desc: LocalizedString
    steps: List[Step]
    props: dict
    src: Source
    deleted: bool = False

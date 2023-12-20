from datetime import datetime
from typing import List, Optional

from bson import ObjectId
from pydantic import BaseModel, Field, BaseConfig, ConfigDict, validator

from models.mongo import PyObjectId


class LocalizedString(BaseModel):
    De: Optional[str] = Field(alias="de", default=None)
    En: Optional[str] = Field(alias="en", default=None)
    Es: Optional[str] = Field(alias="es", default=None)
    Fr: Optional[str] = Field(alias="fr", default=None)
    It: Optional[str] = Field(alias="it", default=None)


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
    id: PyObjectId = Field(alias="_id", default=None)
    quantity: float = Field(alias="quantity", default=None)
    unit: str = Field(alias="unit", default=None)


class Step(BaseModel):
    desc: LocalizedString = Field(alias="desc", default=LocalizedString(lang="en", value=""))
    items: List[StepItem] = Field(alias="items", default=[])
    imgUrl: str = Field(alias="imgUrl", default=None)
    duration: int = Field(alias="duration", default=None)
    temperature: float = Field(alias="temperature", default=None)


class Recipe(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    name: LocalizedString = Field(alias="name", default=LocalizedString(lang="en", value=""))
    desc: LocalizedString = Field(alias="desc", default=LocalizedString(lang="en", value=""))
    steps: List[Step]
    props: dict = Field(alias="props", default={})
    src: Optional[Source] = Field(alias="src", default=None)
    deleted: bool = Field(alias="deleted", default=False)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "name": {
                    "lang": "en",
                    "value": "Example Recipe"
                },
                "desc": {
                    "lang": "en",
                    "value": "This is an example recipe."
                },
                "steps": [
                    {
                        "desc": {
                            "lang": "en",
                            "value": "This is an example step."
                        },
                        "items": [
                            {
                                "quantity": 1,
                                "unit": "cup"
                            }
                        ],
                        "imgUrl": "https://example.com/example.jpg",
                        "duration": 10,
                        "temperature": 350
                    }
                ],
                "props": {
                    "prepTime": 10,
                    "cookTime": 30,
                    "servings": 4,
                    "tags": [
                        "example",
                        "recipe"
                    ],
                    "ingredients": [
                        {
                            "name": {
                                "lang": "en",
                                "value": "Example Ingredient"
                            },
                            "quantity": 1,
                            "unit": "cup"
                        }
                    ]
                },
                "src": {
                    "url": "https://example.com/example.html",
                    "authors": [
                        {
                            "name": "Example Author",
                            "url": "https://example.com/author"
                        }
                    ],
                    "cookBook": {
                        "name": "Example Cookbook",
                        "url": "https://example.com/cookbook",
                        "publisher": "Example Publisher"
                    }
                }
            }
        },
    )

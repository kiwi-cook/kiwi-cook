from typing import List, Optional

from bson import ObjectId
from pydantic import BaseModel, Field, ConfigDict

from models.mongo import PyObjectId
from models.shared import LocalizedString


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


class Step(BaseModel):
    desc: LocalizedString = Field(alias="desc", default=LocalizedString(lang="en", value=""))
    items: Optional[List[str]] = Field(alias="items", default=[])
    imgUrl: Optional[str] = Field(alias="imgUrl", default=None)
    duration: int = Field(alias="duration", default=None)
    temperature: float = Field(alias="temperature", default=None)


class RecipeItem(BaseModel):
    id: PyObjectId = Field(alias="_id", default=None)
    quantity: float = Field(alias="quantity", default=None)
    unit: str = Field(alias="unit", default=None)


class Recipe(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: LocalizedString = Field(alias="name", default=LocalizedString(lang="en", value=""))
    desc: LocalizedString = Field(alias="desc", default=LocalizedString(lang="en", value=""))
    items: List[RecipeItem] = Field(alias="items", default=[])
    steps: List[Step] = Field(alias="steps", default=[])
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
                "items": [
                    {
                        "id": "507f1f77bcf86cd799439011",
                        "quantity": 1,
                        "unit": "cup"
                    }
                ],
                "steps": [
                    {
                        "desc": {
                            "lang": "en",
                            "value": "This is an example step."
                        },
                        "items": [
                            "507f1f77bcf86cd799439011",
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

from typing import List, Optional

from bson import ObjectId
from pydantic import BaseModel, Field, ConfigDict

from models.mongo import PyObjectId
from models.shared import LocalizedString


class Author(BaseModel):
    name: str
    url: Optional[str] = Field(alias="url", default=None)


class CookBook(BaseModel):
    name: Optional[str] = Field(alias="name", default=None)
    url: str
    publisher: Optional[str] = Field(alias="publisher", default=None)


class Source(BaseModel):
    authors: List[Author] = Field(alias="authors", default=[])
    url: Optional[str] = Field(alias="url", default=None)
    cookBook: Optional[CookBook] = Field(alias="cookBook", default=None)


class Step(BaseModel):
    desc: LocalizedString = Field(alias="desc", default=LocalizedString(lang="en", value=""))
    items: Optional[List[str]] = Field(alias="items", default=[])
    imgUrl: Optional[str] = Field(alias="imgUrl", default=None)
    duration: Optional[int] = Field(alias="duration", default=None, ge=1)
    temperature: Optional[float] = Field(alias="temperature", default=None)

    @staticmethod
    def new(desc: LocalizedString, items: List[str], imgUrl: str, duration: int, temperature: float):
        return Step(desc=desc, items=items, imgUrl=imgUrl, duration=duration, temperature=temperature)


class RecipeItem(BaseModel):
    id: PyObjectId = Field(alias="id", default=None)
    quantity: Optional[float] = Field(alias="quantity", default=None, ge=0)
    unit: Optional[str] = Field(alias="unit", default=None)

    @staticmethod
    def new(item_id: ObjectId, quantity: float, unit: str):
        return RecipeItem(id=item_id, quantity=quantity, unit=unit)


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
                            "507f1f77bcf86cd799439011"
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
                    ]
                },
                "src": {
                    "url": "https://example.com/example.html",
                    "authors": [
                        {
                            "name": "John Smith",
                            "url": "https://example.com/john-smith"
                        }
                    ],
                    "cookBook": {
                        "name": "Example Cookbook",
                        "url": "https://example.com/cookbook",
                        "publisher": "Example Publisher"
                    }
                }
            }
        }
    )

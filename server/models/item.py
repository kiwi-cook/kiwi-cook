from typing import Optional

from pydantic import BaseModel, Field

from models.mongo import PyObjectId
from models.recipe import LocalizedString
from util.parse import format_name


class Item(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: LocalizedString = Field(default=LocalizedString(lang='en', value=''), alias='name')
    type: str = Field(default=None, alias='type')
    imgUrl: Optional[str] = Field(default=None, alias='imgUrl')

    class Config:
        allow_population_by_field_name = True
        schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "name": {"en": "Item Name in English", "es": "Nombre del artículo en español"},
                "type": "ItemType",
                "imgUrl": "https://example.com/image.jpg"
            }
        }

    @staticmethod
    def create(name: str, type: str, imgUrl: str = None):
        """
        Creates a new item.
        :param name: name of the item
        :param type: type of the item: 'ingredient', 'tool
        :param imgUrl: URL to an image of the item
        :return: the created item
        """
        return Item(name=LocalizedString.new('en', format_name(name)), type=type, imgUrl=imgUrl)

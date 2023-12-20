from typing import Optional

from bson import ObjectId
from pydantic import BaseModel, Field

from models.mongo import PyObjectId
from models.shared import LocalizedString


class Item(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias='_id')
    name: LocalizedString = Field(default=LocalizedString(lang='en', value=''), alias='name')
    type: str = Field(default=None, alias='type')
    imgUrl: Optional[str] = Field(default=None, alias='imgUrl')

    class Config:
        allow_population_by_field_name = True
        json_encoders = {
            ObjectId: lambda v: str(v)
        }
        schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "name": {"en": "Item Name in English", "es": "Nombre del artículo en español"},
                "type": "ItemType",
                "imgUrl": "http://example.com/image.jpg"
            }
        }

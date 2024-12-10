from datetime import datetime, UTC
from typing import List, Optional, Dict, Any

from bson import ObjectId
from pydantic import BaseModel, Field
from pydantic_core import Url


class BaseRecipeModel(BaseModel):
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            Url: str,
            datetime: lambda x: x.isoformat()
        }


class Nutrition(BaseRecipeModel):
    calories: int = Field(ge=0)
    protein: float = Field(ge=0)
    carbs: float = Field(ge=0)
    fat: float = Field(ge=0)
    fiber: float = Field(ge=0)

    @classmethod
    def create_empty(cls) -> "Nutrition":
        return cls(calories=0, protein=0, carbs=0, fat=0, fiber=0)

    def __repr__(self) -> str:
        return f"Nutr(cal:{self.calories},p:{self.protein:.1f})"


class Recipe(BaseRecipeModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    name: str
    description: str
    image: Optional[List[str]] = None
    language: str = Field(default="en")
    ingredients: List[str]
    instructions: List[str]
    author: Optional[str] = None
    url: Optional[str] = None
    servings: int = Field(default=1, ge=1)
    prep_time: Optional[int] = None
    cook_time: Optional[int] = None
    total_time: Optional[int] = None
    nutrition: Optional[Nutrition] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    deleted: bool = Field(default=False)

    def __repr__(self) -> str:
        name = self.name
        return f"Recipe({name[:13]}...)" if len(name) > 16 else f"Recipe({name})"

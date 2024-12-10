from datetime import datetime, UTC
from typing import List, Optional, Dict, Any

from bson import ObjectId
from pydantic import BaseModel, Field, HttpUrl, field_serializer
from pydantic_core import core_schema, Url


class PyObjectId(str):
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type: Any, _handler: Any) -> core_schema.CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                ])
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(str)
        )

    @classmethod
    def validate(cls, value) -> ObjectId:
        if not ObjectId.is_valid(value):
            raise ValueError("Invalid ObjectId")
        return ObjectId(value)

    def __repr__(self) -> str:
        return f"ObjId({str(self)[:8]}...)"


class BaseRecipeModel(BaseModel):
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            Url: str,
            datetime: lambda x: x.isoformat()
        }


class RecipeIngredient(BaseRecipeModel):
    ingredient: str
    quantity: Optional[float] = None
    unit: Optional[str] = None

    @classmethod
    def create(cls, ingredient: str, quantity: Optional[float] = None,
               unit: Optional[str] = None) -> "RecipeIngredient":
        if not ingredient:
            raise ValueError("Ingredient cannot be empty")
        return cls(ingredient=ingredient, quantity=quantity, unit=unit)

    def __repr__(self) -> str:
        ing_str = self.ingredient
        return f"RecIng({ing_str[:14]}...)" if len(ing_str) > 17 else f"RecIng({ing_str})"

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
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str
    description: str
    lang: str = Field(default="en")
    ingredients: List[RecipeIngredient]
    instructions: List[str]
    props: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    src: Optional[str] = None
    servings: int = Field(default=1, ge=1)
    duration: int = Field(default=0, ge=0)
    nutrition: Nutrition = Field(default_factory=Nutrition.create_empty)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    deleted: bool = Field(default=False)

    def __repr__(self) -> str:
        name = self.name
        return f"Recipe({name[:13]}...)" if len(name) > 16 else f"Recipe({name})"

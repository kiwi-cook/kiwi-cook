from datetime import datetime
from typing import List, Optional, Dict, Any

from bson import ObjectId
from pydantic import BaseModel, Field, HttpUrl, field_serializer
from pydantic_core import core_schema, Url


class PyObjectId(str):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, _source_type: Any, _handler: Any
    ) -> core_schema.CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema(
                [
                    core_schema.is_instance_schema(ObjectId),
                    core_schema.chain_schema(
                        [
                            core_schema.str_schema(),
                            core_schema.no_info_plain_validator_function(cls.validate),
                        ]
                    ),
                ]
            ),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )

    @classmethod
    def validate(cls, value) -> ObjectId:
        if not ObjectId.is_valid(value):
            raise ValueError("Invalid ObjectId")

        return ObjectId(value)


class MultiLanguageField(BaseModel):
    translations: Dict[str, str] = Field(default_factory=dict)

    def __getitem__(self, lang: str) -> str:
        return self.translations.get(lang, "")

    def __setitem__(self, lang: str, value: str):
        self.translations[lang] = value

    @classmethod
    def new(cls, lang: str, value: str):
        print(f"Creating new MultiLanguageField with value: {value}")
        return cls(translations={lang: value})

    def get_langs(self):
        return self.translations.keys()


class Ingredient(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    name: MultiLanguageField

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

    @classmethod
    def new(cls, name: str, id: Optional[PyObjectId] = None, lang: str = "en"):
        print(f"Creating new Ingredient with name: {name}")
        return cls(id=id, name=MultiLanguageField.new(lang, name))


class RecipeIngredient(BaseModel):
    ingredient: Ingredient
    comment: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None

    @classmethod
    def new(
        cls,
        ingredient: Ingredient,
        comment: Optional[str] = None,
        quantity: Optional[float] = None,
        unit: Optional[str] = None,
    ):
        if ingredient is None:
            raise ValueError("Ingredient cannot be None")
        print(f"Creating new RecipeIngredient with ingredient: {ingredient}")
        return cls(ingredient=ingredient, quantity=quantity, unit=unit, comment=comment)


class RecipeStep(BaseModel):
    description: MultiLanguageField
    ingredients: Optional[List[RecipeIngredient]] = None
    img_url: Optional[HttpUrl] = Field(default=None, alias="imgUrl")
    duration: Optional[float] = None
    temperature: Optional[float] = None

    class Config:
        populate_by_name = True

    @classmethod
    def new(
        cls,
        description: MultiLanguageField,
        ingredients: Optional[List[RecipeIngredient]] = None,
        img_url: Optional[HttpUrl] = None,
        duration: Optional[float] = None,
        temperature: Optional[float] = None,
    ):
        print(f"Creating new RecipeStep with description: {description}")
        return cls(
            description=description,
            ingredients=ingredients,
            img_url=img_url,
            duration=duration,
            temperature=temperature,
        )

    @field_serializer("img_url")
    def url2str(self, val) -> str:
        return str(val)


class RecipeAuthor(BaseModel):
    name: str
    url: Optional[HttpUrl] = None

    @field_serializer("url")
    def url2str(self, val) -> str:
        return str(val)


class RecipeSource(BaseModel):
    url: Optional[HttpUrl] = None
    authors: Optional[List[RecipeAuthor]] = None
    cookbooks: Optional[List[str]] = None

    @classmethod
    def from_author(cls, authors: List[str]) -> "RecipeSource":
        return cls(url=None, authors=[RecipeAuthor(name=author) for author in authors])

    @field_serializer("url")
    def url2str(self, val) -> str:
        return str(val)


class Nutrition(BaseModel):
    calories: int
    protein: float
    carbs: float
    fat: float
    fiber: float


class Recipe(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: MultiLanguageField
    description: MultiLanguageField

    ingredients: Optional[List[RecipeIngredient]] = Field(alias="items")
    steps: List[RecipeStep] = Field(alias="steps")
    props: Dict[str, Any] = Field(alias="props")
    src: Optional[RecipeSource] = Field(alias="src", default=None)
    deleted: bool = Field(alias="deleted", default=False)
    servings: int = Field(default=1)

    duration: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    cuisine: Optional[str] = None
    difficulty: str = Field(default="medium")
    rating: Optional[float] = Field(ge=0, le=5, default=None)
    nutrition: Optional[Nutrition] = None
    image_url: Optional[HttpUrl] = None
    video_url: Optional[HttpUrl] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, Url: str, datetime: lambda x: x.isoformat()}

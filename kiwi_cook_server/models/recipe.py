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

    def __str__(self):
        return f"ObjId({str(self)[:8]}...)"


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

    def get_langs(self) -> list[str]:
        return list(self.translations.keys())

    def get_first(self) -> str:
        return next(iter(self.translations.values()), "")

    def __str__(self):
        first = self.get_first()
        return f"{first[:17]}..." if len(first) > 20 else first


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

    def __str__(self):
        return (
            f"Ing({str(self.name)[:17]}...)"
            if len(str(self.name)) > 20
            else f"Ing({self.name})"
        )


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

    def __str__(self):
        ing_str = str(self.ingredient)
        return (
            f"RecIng({ing_str[:14]}...)" if len(ing_str) > 17 else f"RecIng({ing_str})"
        )


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

    def __str__(self):
        desc = str(self.description)
        return f"Step({desc[:15]}...)" if len(desc) > 18 else f"Step({desc})"


class RecipeAuthor(BaseModel):
    name: str
    url: Optional[HttpUrl] = None

    @field_serializer("url")
    def url2str(self, val) -> str:
        return str(val)

    def __str__(self):
        return (
            f"Author({self.name[:14]}...)"
            if len(self.name) > 17
            else f"Author({self.name})"
        )


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

    def __str__(self):
        return (
            f"Source({self.url[:14]}...)"
            if self.url and len(str(self.url)) > 17
            else "Source(...)"
        )


class Nutrition(BaseModel):
    calories: int
    protein: float
    carbs: float
    fat: float
    fiber: float

    def __str__(self):
        return f"Nutr(cal:{self.calories},p:{self.protein:.1f})"


class Recipe(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: MultiLanguageField
    description: MultiLanguageField
    lang: str = Field(default="en-US")

    ingredients: Optional[List[RecipeIngredient]]
    steps: List[RecipeStep]
    props: Dict[str, Any]
    src: Optional[RecipeSource] = Field(alias="src", default=None)
    deleted: bool = Field(alias="deleted", default=False)
    servings: int = Field(default=1)

    duration: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    cuisine: Optional[str] = None
    difficulty: str = Field(default="medium")
    nutrition: Optional[Nutrition] = None
    image_url: Optional[HttpUrl] = None
    video_url: Optional[HttpUrl] = None

    rating: Optional[float] = Field(ge=0, le=5, default=None)
    fav_count: int = Field(default=0)
    view_count: int = Field(default=0)
    comment_count: int = Field(default=0)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, Url: str, datetime: lambda x: x.isoformat()}

    def __str__(self):
        name = str(self.name)
        return f"Recipe({name[:13]}...)" if len(name) > 16 else f"Recipe({name})"

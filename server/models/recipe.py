from pydantic import BaseModel, Field, ConfigDict, HttpUrl
from typing import List, Optional, Dict, Any
from datetime import datetime


class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not isinstance(v, str):
            raise ValueError("PyObjectId must be a string")
        return v


class LocalizedString(BaseModel):
    lang: str
    value: str

    @classmethod
    def new(cls, lang: str, value: str):
        return cls(lang=lang, value=value)

    def get_langs(self):
        return [self.lang]


class Ingredient(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    name: LocalizedString

    class Config:
        allow_population_by_field_name = True

    @classmethod
    def new(cls, name: str, id: Optional[PyObjectId] = None):
        return cls(id=id, name=LocalizedString.new('en', name))


class RecipeIngredient(BaseModel):
    item: Ingredient
    quantity: Optional[float] = None
    unit: Optional[str] = None

    @classmethod
    def new(cls, item: Ingredient, quantity: Optional[float] = None, unit: Optional[str] = None):
        return cls(item=item, quantity=quantity, unit=unit)


class RecipeStep(BaseModel):
    description: LocalizedString
    ingredients: Optional[List[RecipeIngredient]] = None
    img_url: Optional[HttpUrl] = Field(default=None, alias="imgUrl")
    duration: Optional[int] = None
    temperature: Optional[int] = None

    class Config:
        allow_population_by_field_name = True

    @classmethod
    def new(cls, description: LocalizedString, ingredients: Optional[List[RecipeIngredient]] = None,
            img_url: Optional[HttpUrl] = None, duration: Optional[int] = None,
            temperature: Optional[int] = None):
        print(f"Creating new RecipeStep with description: {description}")
        return cls(description=description, ingredients=ingredients, img_url=img_url, duration=duration, temperature=temperature)


class RecipeAuthor(BaseModel):
    name: str
    url: Optional[HttpUrl] = None


class RecipeSource(BaseModel):
    url: HttpUrl
    authors: List[RecipeAuthor]
    cookbooks: List[str] = []


class Nutrition(BaseModel):
    calories: int
    protein: float
    carbs: float
    fat: float
    fiber: float


class Recipe(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: LocalizedString
    description: LocalizedString

    ingredients: Optional[List[RecipeIngredient]] = Field(alias="items")
    steps: List[RecipeStep] = Field(alias="steps")
    props: Dict[str, Any] = Field(alias="props")
    src: Optional[RecipeSource] = Field(alias="src", default=None)
    deleted: bool = Field(alias="deleted", default=False)

    duration: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    cuisine: Optional[str] = None
    difficulty: str = Field(default="medium")
    rating: Optional[float] = Field(ge=0, le=5, default=None)
    nutrition: Optional[Nutrition] = None
    image_url: Optional[HttpUrl] = None
    video_url: Optional[HttpUrl] = None

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "name": {
                    "lang": "en",
                    "value": "Spaghetti Carbonara"
                },
                "desc": {
                    "lang": "en",
                    "value": "A classic Italian pasta dish with eggs, cheese, and pancetta."
                },
                "items": [
                    {
                        "id": "507f1f77bcf86cd799439011",
                        "quantity": 400,
                        "unit": "g",
                        "name": "spaghetti"
                    },
                    {
                        "id": "507f1f77bcf86cd799439012",
                        "quantity": 200,
                        "unit": "g",
                        "name": "pancetta"
                    }
                ],
                "steps": [
                    {
                        "desc": {
                            "lang": "en",
                            "value": "Cook spaghetti in salted boiling water until al dente."
                        },
                        "items": [
                            "507f1f77bcf86cd799439011"
                        ],
                        "duration": 10,
                        "temperature": None
                    }
                ],
                "props": {
                    "prepTime": 15,
                    "cookTime": 20,
                    "servings": 4,
                    "tags": [
                        "italian",
                        "pasta",
                        "dinner"
                    ]
                },
                "src": {
                    "url": "https://example.com/spaghetti-carbonara.html",
                    "authors": [
                        {
                            "name": "Chef Mario",
                            "url": "https://example.com/chef-mario"
                        }
                    ]
                },
                "cuisine": "Italian",
                "difficulty": "medium",
                "rating": 4.5,
                "nutrition": {
                    "calories": 650,
                    "protein": 25.5,
                    "carbs": 80.2,
                    "fat": 22.3,
                    "fiber": 3.1
                },
                "image_url": "https://example.com/spaghetti-carbonara.jpg",
                "video_url": "https://example.com/spaghetti-carbonara-video.mp4"
            }
        }
    )

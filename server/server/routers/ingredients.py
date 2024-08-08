from fastapi import APIRouter, UploadFile
from fastapi.responses import HTMLResponse

from models.api import APIResponseList
from database.mongodb import get_database
from chatgpt.ingredients import analyze_image

client = get_database()
router = APIRouter()

@router.post("/ingredient/image")
async def analyze_ingredient_image(image: UploadFile | None = None):
    if image is None:
        return {"error": True, "response": "No image provided"}

    contents = await image.read()
    ingredients_list = analyze_image(contents)

    if ingredients_list is None:
        return {"error": True, "response": "Error processing the image"}

    return {"error": False, "response": ingredients_list}


@router.get("/ingredient/upload")
async def create_upload_file():
    content = """
<body>
    <form action="/ingredient/upload" enctype="multipart/form-data" method="post">
        <input name="image" type="file">
        <input type="submit">
    </form>
</body>
    """
    return HTMLResponse(content=content)


@router.get(
    "/ingredient/",
    response_description="Get all ingredients",
    response_model=APIResponseList[str],
    response_model_by_alias=False,
    response_model_exclude_none=True,
)
def read_ingredients():
    return {
        "error": False,
        "response": list(client["recipes"]["ingredients"].find({"type": "ingredient"})),
    }


@router.get(
    "/ingredient/{ingredient_id}",
    response_description="Get ingredient information",
    response_model=APIResponseList[str],
    response_model_by_alias=False,
    response_model_exclude_none=True,
)
def read_ingredient(ingredient_id: str):
    return {
        "error": False,
        "response": list(client["recipes"]["ingredients"].find({"_id": ingredient_id})),
    }

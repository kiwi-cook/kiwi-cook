import base64
import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

OPENAI_MODEL = "gpt-4o-mini"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Set up the OpenAI client
open_ai_client = OpenAI(api_key=OPENAI_API_KEY)


def generate_weekplan_from_ingredients_image(
        ingredients_list=None, image: bytes = None
) -> list[str]:
    if ingredients_list is None:
        ingredients_list = []
    try:
        if not ingredients_list and not image:
            return []

        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Based on the ingredients and products you see in the image and in the list, "
                                "please provide a weekplan for the ingredients. Respond only with a list of strings, "
                                "each string being a meal for a day of the week. Do not add numbers, separate the "
                                "list by comma."
                                "Do not format the list as markdown or any other format. Do not hallucinate "
                                "ingredients. If you see an ingredient in the image, you must include it in the weekplan.\n\n"
                                "Here is the list of ingredients:\n"
                                + ", ".join(ingredients_list),
                    }
                ],
            }
        ]

        if image:
            messages[0]["content"].append(
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64.b64encode(image).decode()}"
                    },
                }
            )

        response = open_ai_client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=messages,
            max_tokens=300,
        )

        recipes_text = response.choices[0].message.content
        recipes_list = recipes_text.split(",")
        return recipes_list
    except Exception as e:
        return []

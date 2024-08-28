import base64
import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

OPENAI_MODEL = "gpt-4o-mini"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Set up the OpenAI client
open_ai_client = OpenAI(api_key=OPENAI_API_KEY)


def find_ingredients_in_image(contents: bytes) -> list[str] | None:
    try:
        # Call the OpenAI API
        response = open_ai_client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "List the ingredients and products you see in this image. Respond with only a "
                                    "python list of strings, each string being an ingredient. Do not format the list "
                                    "as markdown or any other format."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64.b64encode(contents).decode()}"
                            }
                        },
                    ],
                }
            ],
            max_tokens=300,
        )

        # Extract and process the model's response
        ingredients_text = response.choices[0].message.content
        # Convert the string representation of a list to an actual list
        ingredients_list = eval(ingredients_text)
        return ingredients_list
    except Exception as e:
        print(e)
        return None

# Connect to MongoDB
import os
from typing import List

from lib.database.mongodb import get_database
from lib.pipeline.recipe.load_html import LoadHtml
from lib.pipeline.recipe.load_json import LoadJson
from lib.pipeline.recipe.parse_recipe_allrecipes_json import ParseRecipeAllRecipes
from lib.pipeline.recipe.parse_recipe_html import ParseRecipeHtml
from lib.pipeline.recipe.pipeline import Pipeline
from lib.pipeline.recipe.process_html import ImportHtml, ExportHtml

read_client = get_database("READ")
write_client = get_database("WRITE")


def get_html_pipeline():
    # Initialize the pipeline
    html_crawler_pipeline = Pipeline()
    load_html_stage = LoadHtml(max_size=100)
    export_html_stage = ExportHtml(write_client)
    parse_recipe_stage = ParseRecipeHtml(write_client)

    html_crawler_pipeline.add_element(load_html_stage)
    html_crawler_pipeline.add_element(export_html_stage)
    html_crawler_pipeline.add_element(parse_recipe_stage)

    return html_crawler_pipeline


def get_json_pipeline():
    # Initialize the pipeline
    json_crawler_pipeline = Pipeline()

    load_json_allrecipes = LoadJson()
    parse_recipe_stage = ParseRecipeAllRecipes(write_client)

    json_crawler_pipeline.add_element(load_json_allrecipes)
    json_crawler_pipeline.add_element(parse_recipe_stage)

    return json_crawler_pipeline


async def run_html_pipeline(feed: List[str]):
    html_crawler_pipeline = get_html_pipeline()

    for url in feed:
        await html_crawler_pipeline.feed(url)
    await html_crawler_pipeline.run()


async def run_html_pipeline_from_path(file_path: str):
    html_crawler_pipeline = get_html_pipeline()

    with open(file_path, "r") as file:
        urls = file.readlines()
        for url in urls:
            url = url.strip().replace("\n", "").replace("\r", "")
            await html_crawler_pipeline.feed(url)
        await html_crawler_pipeline.run()


async def run_json_pipeline(folder_path: str):
    json_crawler_pipeline = get_json_pipeline()

    # Recursively walk through all subfolders and files
    for root, dirs, files in os.walk(folder_path):
        print(f"Found {len(files)} files in the folder: {root}")

        for file_name in files:
            if file_name.endswith(".json"):
                full_path = os.path.join(root, file_name)
                print(f"Feeding file: {full_path}")
                await json_crawler_pipeline.feed(full_path)

    await json_crawler_pipeline.run()

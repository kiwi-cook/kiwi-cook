# Connect to MongoDB
from typing import List

from lib.database.mongodb import get_database
from lib.pipeline.recipe.crawl import RecipeCrawler
from lib.pipeline.recipe.download import HtmlRecipeLoader, HtmlRecipeSaver
from lib.pipeline.recipe.parse import RecipeParser
from lib.pipeline.recipe.pipeline import Pipeline

read_client = get_database("READ")
write_client = get_database("WRITE")

# Initialize the pipeline
crawler_pipeline = Pipeline()
crawler = RecipeCrawler(max_size=100)
download = HtmlRecipeSaver(write_client)
load = HtmlRecipeLoader(read_client)
scraper = RecipeParser(write_client)

crawler_pipeline.add_element(crawler)
crawler_pipeline.add_element(download)
crawler_pipeline.add_element(scraper)


async def run_pipeline(feed: List[str]):
    """
    Fills the pipeline with the necessary elements.
    """
    for url in feed:
        await crawler_pipeline.feed(url)
    await crawler_pipeline.run()


async def run_pipeline_from_file(file_path: str):
    """
    Fills the pipeline with the necessary elements.
    """
    with open(file_path, "r") as file:
        urls = file.readlines()
        for url in urls:
            url = url.strip().replace("\n", "").replace("\r", "")
            await crawler_pipeline.feed(url)
        await crawler_pipeline.run()

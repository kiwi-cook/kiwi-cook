# Connect to MongoDB
from typing import List

from database.mongodb import get_database
from pipeline.crawl import RecipeCrawler
from pipeline.download import HtmlRecipeLoader, HtmlRecipeSaver
from pipeline.pipeline import Pipeline
from pipeline.scrape import RecipeScraper

mongo_client = get_database()

# Initialize the pipeline
crawler_pipeline = Pipeline()
crawler = RecipeCrawler(max_size=100)
download = HtmlRecipeSaver(mongo_client)
load = HtmlRecipeLoader(mongo_client)
scraper = RecipeScraper(mongo_client)

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

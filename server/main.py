#!.venv/bin/python
# -*- coding: utf-8 -*-
import argparse
import asyncio
import sys

from pipeline.crawl import RecipeCrawler
from pipeline.download import HtmlRecipeSaver, HtmlRecipeLoader
from pipeline.pipeline import Pipeline
from pipeline.scrape import RecipeScraper
from server.app import start_server

mongo_client = None  # Replace this with your own MongoDB client

# Initialize the pipeline
crawler_pipeline = Pipeline()
crawler = RecipeCrawler("Crawler", max_size=100)
download = HtmlRecipeSaver(mongo_client)
load = HtmlRecipeLoader(mongo_client)
scraper = RecipeScraper("Scraper")

crawler_pipeline.add_element(crawler)
crawler_pipeline.add_element(download)
crawler_pipeline.add_element(scraper)


async def run_pipeline():
    """
    Fills the pipeline with the necessary elements.
    """
    await crawler_pipeline.feed("https://cooking.nytimes.com/recipes/1025480-spaghetti-sauce")

    await crawler_pipeline.run()


def main():
    # Parse the command line arguments
    parser = argparse.ArgumentParser(description=f"Recipe pipeline")
    parser.add_argument(
        "--online",
        help="Run pipeline from the web (online)",
        action="store_true",
        required=False,
    )
    parser.add_argument(
        "--offline",
        help="Run pipeline from the disk (offline)",
        action="store_true",
        required=False,
    )
    parser.add_argument(
        "-s", "--server", help="Run the server", action="store_true", required=False
    )
    parser.add_argument(
        "-f",
        "--file",
        help="Queries file",
        default="queries.txt",
        type=str,
        required=False,
    )
    parser.add_argument(
        "-d", "--debug", help="Debug mode", action="store_true", required=False
    )

    try:
        args = parser.parse_args()

        # Start the pipeline
        if args.online:
            # Crawl the websites and start the pipeline
            asyncio.run(run_pipeline())
        elif args.server:
            # Start the server
            start_server()
        else:
            parser.print_help()

    except argparse.ArgumentError as e:
        print(
            f"An error occurred while parsing the command line arguments: {str(e)}",
            file=sys.stderr,
        )
    except Exception as e:
        print(f"An error occurred: {str(e)}", file=sys.stderr)


if __name__ == "__main__":
    main()

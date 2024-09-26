import lzma
import pickle

from lib.pipeline.recipe.pipeline import PipelineElement


class HtmlRecipeSaver(PipelineElement):
    def __init__(self, mongo_client):
        super().__init__("Saver")
        self.mongo_client = mongo_client

    async def process_task(self, url: str, html: str) -> (str, str):
        """
        Downloads the content of a page.
        """

        if html and not self.mongo_client["recipes"]["html"].find_one({"url": url}):
            # Save the raw HTML content to mongo
            compressed_html = lzma.compress(pickle.dumps(html))
            self.mongo_client["recipes"]["html"].insert_one(
                {"html": compressed_html, "url": url}
            )

        return url, html


class HtmlRecipeLoader(PipelineElement):
    def __init__(self, mongo_client):
        super().__init__("Loader")
        self.mongo_client = mongo_client

    async def process_task(self, args) -> (str, str):
        """
        Loads the content of a page from the database.
        """

        entry = self.mongo_client["recipes"]["html"].find_one()
        if entry is None:
            return None
        url, compressed_html = entry["url"], entry["html"]
        html = pickle.loads(lzma.decompress(compressed_html))

        return url, html

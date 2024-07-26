import lzma
import pickle

from pipeline.pipeline import PipelineElement


class HtmlRecipeSaver(PipelineElement):
    def __init__(self, mongo_client):
        super().__init__("Saver")
        self.mongo_client = mongo_client

    async def process_task(self, task: str):
        """
        Downloads the content of a page.
        """

        html = task

        # Save the raw HTML content to mongo
        compressed_html = lzma.compress(pickle.dumps(html))
        self.mongo_client.insert_one({"html": compressed_html})

        return html


class HtmlRecipeLoader(PipelineElement):
    def __init__(self, mongo_client):
        super().__init__("Loader")
        self.mongo_client = mongo_client

    async def process_task(self, task: str):
        """
        Loads the content of a page from the database.
        """

        compressed_html = self.mongo_client.find_one()
        html = pickle.loads(lzma.decompress(compressed_html))

        return html

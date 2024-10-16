from lib.pipeline.recipe.pipeline import PipelineElement


class LoadJson(PipelineElement):
    def __init__(self):
        super().__init__("LoadJson")

    async def process_task(self, file_path: str) -> str:
        """
        Loads the content of a page from the database.
        """

        # Load the JSON file
        with open(file_path, "r") as file:
            json_content = file.read()

        return json_content

from models.recipe import Recipe
from pipeline.pipeline import PipelineElement


class RecipeSummarizer(PipelineElement):
    def __init__(self, summary_model: str = "google/pegasus-xsum"):
        super().__init__("Summary")

        # Load summarization pipeline
        from transformers import pipeline

        self.summary_model = summary_model
        print(
            f"Loading summarization model {summary_model}... This may take a few minutes."
        )
        self.summarizer_pipeline = pipeline(
            "summarization", model=summary_model, tokenizer=summary_model
        )

    def summarize_text(self, text: str, max_words: int = 20) -> str:
        if not text:
            return "No text provided for summarization."

        summarized_text = self.summarizer_pipeline(
            text, max_length=max_words * 2, min_length=max_words, do_sample=False
        )[0]["summary_text"]

        words = summarized_text.split()
        return " ".join(words[:max_words]) + ("..." if len(words) > max_words else "")

    def summarize_soup(self, recipe: Recipe, lang: str = "en") -> str:
        text = recipe.description[lang]
        for step in recipe.steps:
            text += " " + step.description[lang]

        return self.summarize_text(text)

    async def process_task(self, task: Recipe):
        soup = task
        return self.summarize_soup(soup)

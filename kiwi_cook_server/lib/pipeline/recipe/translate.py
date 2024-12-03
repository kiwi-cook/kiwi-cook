from lib.pipeline.recipe.pipeline import PipelineElement
from typing import Tuple
from transformers import AutoTokenizer, AutoModelForSeq2SeqTranslation
import torch

class TranslateText(PipelineElement):
    def __init__(self, model_name: str = "Helsinki-NLP/opus-mt-en-es"):
        """
        Initialize the translator with a pre-trained model.
        Default model translates English to Spanish, but you can use any model
        from Hugging Face Hub for different language pairs.
        """
        super().__init__("Translator")
        self.model_name = model_name
        # Load model and tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSeq2SeqTranslation.from_pretrained(model_name)

    async def process_task(self, args) -> Tuple[str, str]:
        """
        Translates text using the Transformers model.

        Args:
            args (dict): Dictionary containing:
                - text (str): The text to translate

        Returns:
            Tuple[str, str]: (translated_text, error_message)
        """
        try:
            text = args.get('text')

            if not text:
                return "", "Missing text parameter"

            # Tokenize the input text
            inputs = self.tokenizer(text, return_tensors="pt", padding=True)

            # Generate translation
            with torch.no_grad():
                translated = self.model.generate(**inputs)

            # Decode the generated tokens to text
            translated_text = self.tokenizer.batch_decode(translated,
                                                          skip_special_tokens=True)[0]

            return translated_text, ""

        except Exception as e:
            return "", f"Translation error: {str(e)}"

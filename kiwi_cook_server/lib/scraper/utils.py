import unicodedata

from lib.logging import logger


def fraction_to_float(fraction: str) -> float:
    """Convert string representation of a fraction to float.

    Code from https://github.com/justinmklam/recipe-converter/blob/master/recipeconverter/utils.py
    Also supports unicode characters.

    Args:
        fraction (str): String representation of fraction, ie. "3/4", "1 1/2", etc.

    Returns:
        float: Converted fraction
    """
    # For fractions with weird divider character (ie. "1⁄2")
    fraction = fraction.replace("⁄", "/")

    try:
        # Convert unicode fractions (ie. "½")
        fraction_out = unicodedata.numeric(fraction)
    except TypeError:
        try:
            # Convert normal fraction (ie. "1/2")
            fraction_out = float(sum(Fraction(s) for s in fraction.split()))
        except ValueError:
            # Convert a combined fraction with Unicode (i.e. "1 ½")
            fraction_split = fraction.split()
            fraction_out = float(fraction_split[0]) + unicodedata.numeric(
                fraction_split[1]
            )

    return fraction_out


import re
from fractions import Fraction


def extract_number_from_string(text: str) -> float or None:
    """
    Extracts any number (integer, decimal, fraction, or mixed number) from a string and returns it as a float.

    Args:
        text (str): String containing a number.

    Returns:
        float or None: The extracted number as a float, or None if no valid number is found.

    Examples:
        >>> extract_number_from_string("1/2 cup")
        0.5
        >>> extract_number_from_string("1 1/2 cup")
        1.5
        >>> extract_number_from_string("1.5 cup")
        1.5
        >>> extract_number_from_string("1 cup")
        1.0
        >>> extract_number_from_string("12 servings")
        12.0
        >>> extract_number_from_string("1⁄2")
        0.5
        >>> extract_number_from_string("")
        None
        >>> extract_number_from_string("no numbers here")
        None
    """
    if not text or not isinstance(text, str):
        return None

    # Regular expression to match numbers, including fractions and decimals
    pattern = r'(\d+\s\d+/\d+|\d+/\d+|\d+\.\d+|\d+)'
    match = re.search(pattern, text)

    if not match:
        return None

    number_str = match.group(0)

    try:
        # Handle mixed numbers (e.g., "1 1/2")
        if ' ' in number_str:
            whole, fraction = number_str.split()
            return float(whole) + float(Fraction(fraction))
        # Handle fractions (e.g., "1/2")
        elif '/' in number_str:
            return float(Fraction(number_str))
        # Handle decimals or integers (e.g., "1.5" or "12")
        else:
            return float(number_str)
    except (ValueError, ZeroDivisionError) as e:
        return None


import requests
import base64
from PIL import Image
from io import BytesIO
import logging

logger = logging.getLogger(__name__)


def image_url_to_base64s(urls: str or list[str], max_size: tuple[float, float] = (800, 800), quality: int = 85) -> list[str]:
    """Convert a list of image URLs to compressed base64 strings efficiently.

    Args:
        urls (str or list[str]): The list of image URLs or a single URL.
        max_size (tuple): Maximum width and height for resizing the image (default: 800x800).
        quality (int): The quality of the compressed image (1-100, higher is better quality).

    Returns:
        list[str]: The list of compressed base64 representations of the images.
    """

    def __process_image(url: str) -> str:
        """Fetch, compress, and convert an image URL to a base64 string.

        Args:
            url (str): The URL of the image.

        Returns:
            str: The compressed base64 representation of the image.
        """
        try:
            # Fetch the image from the URL
            response = requests.get(url, stream=True, timeout=10)
            response.raise_for_status()

            # Open the image using PIL
            image = Image.open(BytesIO(response.content))

            # Convert to RGB if the image has an alpha channel (e.g., PNG)
            if image.mode in ("RGBA", "P"):
                image = image.convert("RGB")

            # Resize the image if it exceeds the max dimensions
            image.thumbnail(max_size)

            # Compress the image
            compressed_image_io = BytesIO()
            image.save(compressed_image_io, format="JPEG", quality=quality)
            compressed_image_io.seek(0)

            # Convert the compressed image to Base64
            return base64.b64encode(compressed_image_io.read()).decode("utf-8")
        except Exception as e:
            logger.error(f"Error processing image from URL {url}: {e}")
            return ""

    # Ensure URLs is a list
    if isinstance(urls, str):
        urls = [urls]

    # Process each URL and return the results
    return [__process_image(url) for url in urls]


def safe_extract(method, post_processes=None):
    """
    Helper function to safely call a scraper method and optionally process its result.

    Args:
        method (callable): The scraper method to call.
        post_processes (list[callable], optional): A list of functions to process the result of the method.

    Returns:
        The result of the method (optionally processed), or None if an error occurs.
    """
    try:
        # Ensure the method is callable
        if not callable(method):
            raise TypeError(f"Provided method '{method}' is not callable.")

        # Call the method to get the result
        result = method()

        # Apply post-processing functions if provided
        if post_processes:
            if not isinstance(post_processes, (list, tuple)):
                raise TypeError("post_processes must be a list or tuple of callables.")

            for post_process in post_processes:
                if not callable(post_process):
                    raise TypeError(f"Post-process function '{post_process}' is not callable.")
                result = post_process(result)

        return result
    except Exception as e:
        # Handle cases where method might not have a __name__ attribute
        method_name = getattr(method, "__name__", str(method))
        logger.error(f"Error extracting {method_name}: {e}")
        return None

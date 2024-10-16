import hashlib
import os
import re


def safe_join(items: list[str | None]):
    """
    Safely joins a list of items into a string, separating them with a space.
    If an item is None, it is skipped.

    Args:
        items:

    Returns:

    """
    return " ".join(str(item) for item in items if item is not None)


def safe_str(item: str | None):
    """
    Safely converts an item to a string. If the item is None, an empty string is returned.
    Args:
        item:

    Returns:

    """
    return str(item) if item is not None else ""


def calculate_directory_hash(directory="."):
    hash_obj = hashlib.md5()
    for root, dirs, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            if os.path.isfile(file_path):
                with open(file_path, "rb") as f:
                    for chunk in iter(lambda: f.read(4096), b""):
                        hash_obj.update(chunk)
    return hash_obj.hexdigest()


def parse_iso8601_duration(duration_str: str) -> int:
    """
    Parses an ISO 8601 duration string (e.g., "PT5M", "PT40M") and returns the total time in minutes.

    Args:
        duration_str (str): ISO 8601 duration string.

    Returns:
        int: Total time in minutes.
    """
    # Regular expression to match the ISO 8601 duration format
    pattern = re.compile(r'P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?')

    # Match the pattern
    match = pattern.match(duration_str)
    if not match:
        return 0

    # Extract the matched groups (days, hours, minutes, seconds)
    days = int(match.group(1)) if match.group(1) else 0
    hours = int(match.group(2)) if match.group(2) else 0
    minutes = int(match.group(3)) if match.group(3) else 0
    seconds = int(match.group(4)) if match.group(4) else 0

    # Convert everything to minutes
    total_minutes = days * 24 * 60 + hours * 60 + minutes + (seconds // 60)
    return total_minutes

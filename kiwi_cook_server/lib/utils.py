import hashlib
import os


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

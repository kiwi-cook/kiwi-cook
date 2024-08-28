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

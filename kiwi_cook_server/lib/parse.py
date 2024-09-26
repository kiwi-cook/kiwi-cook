import re
from decimal import Decimal
from typing import List, Optional


def extract_temperature(instruction: str) -> Optional[int]:
    """Extract the temperature from a string."""
    if not isinstance(instruction, str):
        raise ValueError("Input must be a string")
    if len(instruction) > 1000:  # Arbitrary limit to prevent excessively long inputs
        raise ValueError("Input string is too long")

    try:
        match = re.search(r"\b(\d{1,3})\s*°?\s*([CF])\b", instruction)
        if not match:
            return None
        temperature = int(match.group(1))
        unit = match.group(2)
        if unit == "F":
            temperature = round((temperature - 32) * 5 / 9)
        return temperature
    except Exception as e:
        raise ValueError(f"Error extracting temperature: {str(e)}")


def extract_durations(instruction: str) -> List[Decimal]:
    """Extract the duration from a string."""
    if not isinstance(instruction, str):
        raise ValueError("Input must be a string")
    if len(instruction) > 1000:
        raise ValueError("Input string is too long")

    try:
        matches = re.findall(
            r"\b(\d+)(?:-(\d+))?\s*(h|hr|hrs|hour|hours|m|min|mins|minute|minutes)\b",
            instruction,
            flags=re.IGNORECASE,
        )
        durations = []
        for match in matches:
            from_duration = int(match[0])
            to_duration = int(match[1]) if match[1] else from_duration
            unit = match[2].lower()
            if unit.startswith("h"):
                from_duration *= 60
                to_duration *= 60
            avg_duration = Decimal(from_duration + to_duration) / 2
            durations.append(avg_duration)
        return durations
    except Exception as e:
        raise ValueError(f"Error extracting durations: {str(e)}")


def format_name(name: str) -> str:
    """Format the name of a recipe."""
    if not isinstance(name, str):
        raise ValueError("Input must be a string")
    if len(name) > 200:  # Arbitrary limit to prevent excessively long inputs
        raise ValueError("Input string is too long")

    try:
        # Remove special characters and replace spaces with hyphens
        formatted_name = re.sub(r"[^a-zA-Z0-9\s-]", "", name)
        formatted_name = re.sub(r"\s+", "-", formatted_name)

        # Capitalize the first letter of each word
        formatted_name = "-".join(
            word.capitalize() for word in formatted_name.split("-")
        )

        return formatted_name
    except Exception as e:
        raise ValueError(f"Error formatting name: {str(e)}")

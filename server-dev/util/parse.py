import re


def extract_temperature(instruction: str) -> float:
    """Extract the temperature from a string."""
    print(f'Extracting temperature from instruction: {instruction}')
    match = re.search(r'\b(\d{1,3})\s*°?\s*(C|F)\b', instruction)
    if not match:
        return None
    temperature = float(match.group(1))
    unit = match.group(2)
    if unit == 'F':
        temperature = (temperature - 32) * 5 / 9
    return temperature


def extract_durations(instruction: str) -> list[int]:
    """Extract the duration from a string."""
    matches = re.findall(r'/\b(\d+)(?:-(\d+))?\s*(h|hr|hrs|hour|hours|m|min|mins|minute|minutes)\b/gm', instruction)
    durations = []
    for match in matches:
        from_duration = int(match.group(1))
        to_duration = int(match.group(2)) if match.group(2) else from_duration
        unit = match.group(3)
        if unit in ['h', 'hr', 'hrs', 'hour', 'hours']:
            from_duration *= 60
            to_duration *= 60
        avg_duration = (from_duration + to_duration) / 2
        durations.append(avg_duration)
    return durations

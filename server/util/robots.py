import aiohttp
import asyncio
from urllib import robotparser
import cachetools

from util.url import get_base_url

# Cache for storing robots.txt contents
robots_cache = cachetools.TTLCache(maxsize=1000, ttl=3600)  # Cache up to 1000 entries, TTL of 1 hour


async def fetch_robots_txt(session, robots_url):
    async with session.get(robots_url) as response:
        if response.status == 200:
            return await response.text()
        return None


async def check_robots(url: str) -> bool:
    """
    Respect robots.txt and check if we can fetch a URL.
    For more information: http://www.robotstxt.org/robotstxt.html

    Parameters:
    - `url` (str): The URL to check.

    Returns:
    - `bool`: Whether we can fetch the URL or not.

    Example:
    ```python
    can_fetch("https://www.tuebingen.de/en/")
    ```
    """
    domain = get_base_url(url)
    robots_url = domain + "/robots.txt"

    # Check if robots.txt is in cache
    if robots_url in robots_cache:
        robots_txt = robots_cache[robots_url]
    else:
        async with aiohttp.ClientSession() as session:
            robots_txt = await fetch_robots_txt(session, robots_url)
            if robots_txt is not None:
                robots_cache[robots_url] = robots_txt

    if robots_txt is None:
        return True

    rp = robotparser.RobotFileParser()
    rp.parse(robots_txt.splitlines())
    return rp.can_fetch("*", url)


# Wrapper function to run the async function
def check_robots_sync(url: str) -> bool:
    return asyncio.run(check_robots(url))

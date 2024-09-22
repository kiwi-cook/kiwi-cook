import asyncio
from urllib.parse import urlparse

import httpx

from pipeline.pipeline import PipelineElement
from lib.robots import check_robots


class RecipeCrawler(PipelineElement):
    def __init__(
        self,
        max_size=1000,
        max_same_domain_concurrent=5,
        ignore_domains=None,
    ):
        super().__init__("Crawler")

        self.user_agents = [
            "Taste Buddy Web Crawler Project (https://github.com/taste-buddy/taste-buddy",
            "Mozilla/5.0 (compatible; TasteBuddyBot/1.0; +https://github.com/taste-buddy/taste-buddy)",
            "Taste Buddy Research Crawler/1.0 (+https://github.com/taste-buddy/taste-buddy; Academic purposes only)",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 "
            "Safari/537.36 (Taste Buddy Web Crawling Project)",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 "
            "Safari/537.36 (Taste Buddy Web Crawler)",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 "
            "Safari/537.36 (Taste Buddy Research Crawler)",
        ]

        self._page_count = 0
        self.headers = {
            "User-Agent": self.user_agent,
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Cache-Control": "max-age=0",
        }

        self.max_size = max_size
        self.max_same_domain_concurrent = max_same_domain_concurrent
        self.ignore_domains = ignore_domains or []

        self.urls_crawled = set()
        self.ignore_links = set()
        self.currently_crawled = set()
        self.currently_crawled_base_urls = []
        self.to_crawl_queue = asyncio.Queue()
        self.to_crawl_set = set()

    @property
    def user_agent(self):
        # Cycle through user agents
        return self.user_agents[self._page_count % len(self.user_agents)]

    async def process_task(self, url: str) -> (str, str):
        """
        Fetches a URL and returns its HTML content.
        Args:
            url: The URL to fetch.

        Returns:

        """
        async with httpx.AsyncClient() as client:
            ret_val = await self.handle_url(client, url)
            if ret_val is not None:
                return ret_val
            return None

    async def handle_url(self, client, url: str) -> (str, str):
        if len(self.urls_crawled) >= self.max_size:
            print("Maximum size reached")
            return None

        base_url = urlparse(url).netloc

        if url in self.currently_crawled:
            print(f"Ignoring {url} because it is already being crawled")
            return None

        if (
            self.currently_crawled_base_urls.count(base_url)
            >= self.max_same_domain_concurrent
        ):
            print(
                f"Ignoring {url} because the base URL is already being crawled {self.max_same_domain_concurrent} times"
            )
            return None

        if not url.startswith("http"):
            print(f"Invalid URL: {url}")
            return None

        if any(domain in url for domain in self.ignore_domains):
            print(f"Ignoring {url} because it is in the ignore domains list")
            self.ignore_links.add(url)
            return None

        if url in self.ignore_links or url in self.urls_crawled:
            print(f"Ignoring {url} because it is in the ignore or found list")
            return None

        # Here you would implement the check_robots function
        if not await check_robots(url):
            print(f"Ignoring {url} because it is disallowed by robots.txt")
            self.ignore_links.add(url)
            return None

        self.currently_crawled.add(url)
        self.currently_crawled_base_urls.append(base_url)

        try:
            print(f"Fetching {url} ...")
            response = await client.get(url, follow_redirects=True)
            response.raise_for_status()
            html_content = response.text
        except httpx.HTTPError as e:
            print(f"Error fetching {url}: {e}")
            return None

        if not html_content:
            print(f"Received empty content from {url}")
            self.ignore_links.add(url)
            self.currently_crawled.remove(url)
            self.currently_crawled_base_urls.remove(base_url)
            return None

        self.urls_crawled.add(url)
        self.currently_crawled.remove(url)
        self.currently_crawled_base_urls.remove(base_url)

        self._page_count += 1

        # Return the HTML content
        return url, html_content

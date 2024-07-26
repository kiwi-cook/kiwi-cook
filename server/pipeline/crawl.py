# Threading
import asyncio
from urllib.parse import urlparse, urljoin

import httpx

from pipeline.pipeline import PipelineElement
from util.robots import check_robots


# Database

def log_error(error_msg):
    print(error_msg)


def log_warning(warning_msg):
    print(warning_msg)


class RecipeCrawler(PipelineElement):
    def __init__(self, base_url, max_size=1000, max_same_domain_concurrent=5,
                 ignore_domains=None, langs=None, required_keywords=None):
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

        self.base_url = base_url
        self.max_size = max_size
        self.max_same_domain_concurrent = max_same_domain_concurrent
        self.ignore_domains = ignore_domains or []
        self.langs = langs or ['en']
        self.required_keywords = required_keywords or []

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

    async def process_task(self, task):
        url = task
        async with httpx.AsyncClient() as client:
            return await self.check_url(client, url)

    async def check_url(self, client, url: str):
        if len(self.urls_crawled) >= self.max_size:
            print("Maximum size reached")
            return

        base_url = urlparse(url).netloc

        if url in self.currently_crawled:
            print(f"Ignoring {url} because it is already being crawled")
            return

        if self.currently_crawled_base_urls.count(base_url) >= self.max_same_domain_concurrent:
            print(
                f"Ignoring {url} because the base URL is already being crawled {self.max_same_domain_concurrent} times")
            return

        if not url.startswith("http"):
            print(f"Invalid URL: {url}")
            return

        if any(domain in url for domain in self.ignore_domains):
            print(f"Ignoring {url} because it is in the ignore domains list")
            self.ignore_links.add(url)
            return

        if url in self.ignore_links or url in self.urls_crawled:
            print(f"Ignoring {url} because it is in the ignore or found list")
            return

        # Here you would implement the check_robots function
        if not await check_robots(url):
            print(f"Ignoring {url} because it is disallowed by robots.txt")
            self.ignore_links.add(url)
            return

        self.currently_crawled.add(url)
        self.currently_crawled_base_urls.append(base_url)

        try:
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
            return

        self.urls_crawled.add(url)
        self.currently_crawled.remove(url)
        self.currently_crawled_base_urls.remove(base_url)

        self._page_count += 1

        # Return the HTML content
        return html_content

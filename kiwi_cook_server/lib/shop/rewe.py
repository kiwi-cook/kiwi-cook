import requests

BASE_URI = "https://shop.rewe.de/api"
REWE_PRODUCTS_URI = "https://shop.rewe.de/api/products?&market={marketID}&\
                    objectsPerPage=100&page={page}&serviceTypes=PICKUP&sorting=RELEVANCE_DESC&source"
REWE_MARKET_SEARCH_URI = "https://www.rewe.de/api/wksmarketsearch?searchTerm={zip_code}"


def get_market_id(zip_code: str) -> list[str]:
    response = requests.get(REWE_MARKET_SEARCH_URI.format(zip_code=zip_code))
    print(response)
    if response.status_code != 200:
        return []

    markets = response.json()["markets"]
    return [market["wwIdent"] for market in markets]


def get_products(market_id: str, page: int) -> list[dict]:
    response = requests.get(REWE_PRODUCTS_URI.format(marketID=market_id, page=page))
    if response.status_code != 200:
        return []

    return response.json()["products"]


print(get_market_id("72072"))

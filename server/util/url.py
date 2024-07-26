import ipaddress
from urllib.parse import urlparse, urljoin


def get_domain(url: str) -> str:
    """
    Extracts the domain from a URL.

    Parameters:
    - `url` (str): The URL to extract the domain from.

    Returns:
    - `str`: The domain of the URL.
    """

    return urlparse(url).netloc


def get_full_url(base_url, relative_url):
    """
    Converts a relative URL to a full URL based on the base URL.

    Parameters:
    - `base_url` (str): The base URL.
    - `relative_url` (str): The relative URL to convert.

    Returns:
    - `str`: The full URL.
    """
    return urljoin(base_url, relative_url)


def get_base_url(url):
    parsed_url = urlparse(url)
    return f"{parsed_url.scheme}://{parsed_url.netloc}"


def is_valid_ip(address: str) -> bool:
    """
    Checks if an address is a valid
    Args:
        address:

    Returns:

    """

    try:
        ipaddress.ip_address(address)
        return True
    except ValueError:
        return False

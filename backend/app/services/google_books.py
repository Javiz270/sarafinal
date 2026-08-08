"""
Google Books API integration service.

Responsibilities:
- Search books by title, author, ISBN, or Google Books ID
- Parse and normalize API responses
- Use API key from environment variables

API docs: https://developers.google.com/books/docs/v1/using
"""

import httpx

from app.core.config import settings

GOOGLE_BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes"


async def search_books(query: str, max_results: int = 20) -> dict:
    """
    Search Google Books API.

    Args:
        query: Search query (title, author, ISBN, etc.)
        max_results: Maximum results to return (default 20)

    Returns:
        Parsed response with total items and book list.
    """
    params = {
        "q": query,
        "maxResults": min(max_results, 40),
    }
    if settings.GOOGLE_BOOKS_API_KEY:
        params["key"] = settings.GOOGLE_BOOKS_API_KEY

    async with httpx.AsyncClient() as client:
        response = await client.get(GOOGLE_BOOKS_API_URL, params=params)
        response.raise_for_status()
        return response.json()


async def get_book_by_id(volume_id: str) -> dict:
    """
    Get a specific book by its Google Books volume ID.

    Args:
        volume_id: Google Books volume ID

    Returns:
        Book details from Google Books API.
    """
    url = f"{GOOGLE_BOOKS_API_URL}/{volume_id}"
    params = {}
    if settings.GOOGLE_BOOKS_API_KEY:
        params["key"] = settings.GOOGLE_BOOKS_API_KEY

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        return response.json()


def parse_volume(volume: dict) -> dict:
    """
    Parse a Google Books API volume into a normalized format.

    Args:
        volume: Raw volume data from Google Books API

    Returns:
        Normalized book data dict.
    """
    info = volume.get("volumeInfo", {})
    identifiers = info.get("industryIdentifiers", [])

    isbn_10 = None
    isbn_13 = None
    for identifier in identifiers:
        if identifier.get("type") == "ISBN_10":
            isbn_10 = identifier.get("identifier")
        elif identifier.get("type") == "ISBN_13":
            isbn_13 = identifier.get("identifier")

    image_links = info.get("imageLinks", {})
    cover_url = image_links.get("thumbnail", image_links.get("smallThumbnail"))

    return {
        "google_books_id": volume.get("id"),
        "title": info.get("title", ""),
        "authors": info.get("authors", []),
        "publisher": info.get("publisher"),
        "published_date": info.get("publishedDate"),
        "description": info.get("description"),
        "isbn_10": isbn_10,
        "isbn_13": isbn_13,
        "cover_url": cover_url,
        "page_count": info.get("pageCount"),
    }

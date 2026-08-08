"""
Google Books API integration service.
"""

import os
import httpx
from typing import List, Optional

from app.schemas.resources import ResourceBase


async def search_google_books(query: str) -> List[ResourceBase]:
    """
    Search Google Books API and map results to SARA's ResourceBase schema.
    """
    if not query.strip():
        return []

    # Prepare parameters
    params = {
        "q": query,
        "maxResults": 10,
    }
    
    # Optional API Key from environment
    api_key = os.environ.get("GOOGLE_BOOKS_API_KEY")
    if api_key:
        params["key"] = api_key

    # Make the request
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://www.googleapis.com/books/v1/volumes",
                params=params
            )
            response.raise_for_status()
            data = response.json()
    except Exception as e:
        # Log the error in a real app; for now, we just return empty
        # to fail gracefully if the external API is down.
        print(f"Error fetching from Google Books: {e}")
        return []

    items = data.get("items", [])
    results = []

    for item in items:
        vol_info = item.get("volumeInfo", {})
        
        # Extract basic info
        title = vol_info.get("title", "Sin título")
        
        authors = vol_info.get("authors", [])
        author = ", ".join(authors) if authors else None
        
        description = vol_info.get("description")
        publisher = vol_info.get("publisher")
        
        # Extract published year
        pub_date = vol_info.get("publishedDate")
        published_year = None
        if pub_date:
            try:
                published_year = int(pub_date.split("-")[0])
            except ValueError:
                pass
                
        # Extract ISBN
        isbn = None
        identifiers = vol_info.get("industryIdentifiers", [])
        for idf in identifiers:
            if idf.get("type") == "ISBN_13":
                isbn = idf.get("identifier")
                break
            elif idf.get("type") == "ISBN_10" and not isbn:
                isbn = idf.get("identifier")
                
        # Extract cover URL (use https if possible)
        cover_url = None
        image_links = vol_info.get("imageLinks", {})
        thumbnail = image_links.get("thumbnail") or image_links.get("smallThumbnail")
        if thumbnail:
            cover_url = thumbnail.replace("http://", "https://")
            
        google_books_id = item.get("id")

        results.append(
            ResourceBase(
                title=title,
                author=author,
                isbn=isbn,
                description=description,
                publisher=publisher,
                published_year=published_year,
                cover_url=cover_url,
                google_books_id=google_books_id,
            )
        )

    return results

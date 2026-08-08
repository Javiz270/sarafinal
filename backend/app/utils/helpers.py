"""
General helpers and utility functions.
"""

from datetime import date, datetime


def format_date(d: date | datetime | None) -> str | None:
    """Format a date for display."""
    if d is None:
        return None
    if isinstance(d, datetime):
        return d.strftime("%d/%m/%Y %H:%M")
    return d.strftime("%d/%m/%Y")


def generate_barcode(prefix: str = "LIB", sequence: int = 1) -> str:
    """Generate a formatted barcode string."""
    return f"{prefix}-{sequence:04d}"

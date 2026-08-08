"""
Report schemas.
"""

from typing import Any
from pydantic import BaseModel


class ReportPreviewResponse(BaseModel):
    """
    Dynamic response for report previews.
    Returns columns metadata and the actual row data.
    """
    columns: list[str]
    rows: list[dict[str, Any]]

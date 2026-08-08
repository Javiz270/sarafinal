"""
Main API router — mounts all sub-routers under /api/.
"""

from fastapi import APIRouter

from app.api import (
    activities,
    auth,
    resources,
    book_copies,
    cubicles,
    dashboard,
    events,
    loans,
    reports,
    users,
    visitors,
    statistics,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(cubicles.router, prefix="/cubicles", tags=["Cubicles"])
api_router.include_router(resources.router, prefix="/resources", tags=["Resources"])
api_router.include_router(book_copies.router, prefix="/book-copies", tags=["Book Copies"])
api_router.include_router(loans.router, prefix="/loans", tags=["Loans"])
api_router.include_router(visitors.router, prefix="/visitors", tags=["Visitors"])
api_router.include_router(events.router, prefix="/events", tags=["Events"])
api_router.include_router(activities.router, prefix="/activities", tags=["Activities"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(statistics.router, prefix="/statistics", tags=["Statistics"])

"""
Health and Public Configuration Endpoints
"""
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(tags=["Health & Config"])

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

@router.get("/config/public")
def get_public_config():
    return {
        "project_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "supported_channels": [
            "Facebook", "Instagram", "LinkedIn", "TikTok",
            "YouTube", "Google Ads", "Email Marketing", "Website/SEO"
        ],
        "default_currency": "LKR",
        "has_gemini_configured": bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here")
    }

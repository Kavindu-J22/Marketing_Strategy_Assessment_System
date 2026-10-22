"""
Health, Public Configuration, and Cross-Service Integration Health Endpoints
"""
from fastapi import APIRouter
from app.core.config import settings
from app.core.database import db

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
    has_openai = bool(
        settings.OPENAI_API_KEY
        and settings.OPENAI_API_KEY.strip()
        and not settings.OPENAI_API_KEY.startswith("sk-proj-YOUR")
    )
    has_pinecone = bool(
        settings.PINECONE_API_KEY
        and settings.PINECONE_API_KEY.strip()
        and not settings.PINECONE_API_KEY.startswith("pcsk_YOUR")
    )
    has_postgres = bool(
        settings.DATABASE_URL
        and "your_db" not in settings.DATABASE_URL
    )

    return {
        "project_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "supported_channels": [
            "Facebook", "Instagram", "LinkedIn", "TikTok",
            "YouTube", "Google Ads", "Email Marketing", "Website/SEO"
        ],
        "default_currency": "LKR",
        "providers": {
            "openai_generation_model": settings.OPENAI_GENERATION_MODEL,
            "openai_embedding_model": settings.OPENAI_EMBEDDING_MODEL,
            "embedding_dimensions": settings.PINECONE_EMBEDDING_DIMENSION,
            "has_openai_configured": has_openai,
            "has_pinecone_configured": has_pinecone,
            "has_postgres_configured": has_postgres,
            "has_gemini_configured": has_openai, # Legacy backward-compatible flag
            "rag_enabled": settings.RAG_ENABLED
        }
    }


@router.get("/integrations/health")
def integrations_health():
    """
    Detailed health check across all shared infrastructure services:
    PostgreSQL (Prisma Postgres), Pinecone, OpenAI, and Better Auth.
    """
    has_openai = bool(settings.OPENAI_API_KEY and not settings.OPENAI_API_KEY.startswith("sk-proj-YOUR"))
    has_pinecone = bool(settings.PINECONE_API_KEY and not settings.PINECONE_API_KEY.startswith("pcsk_YOUR"))
    has_better_auth = bool(settings.BETTER_AUTH_SECRET and not settings.BETTER_AUTH_SECRET.startswith("YOUR_"))

    return {
        "status": "operational",
        "service": settings.PROJECT_NAME,
        "database": {
            "status": "connected" if db.is_postgres_active else "resilient_in_memory_fallback",
            "provider": "Prisma Postgres (PostgreSQL)" if db.is_postgres_active else "In-Memory Transactional Datastore",
            "pool_active": db.is_postgres_active
        },
        "generative_ai": {
            "provider": "OpenAI",
            "model": settings.OPENAI_GENERATION_MODEL,
            "status": "connected" if has_openai else "deterministic_fallback_active"
        },
        "vector_search": {
            "provider": "Pinecone",
            "embedding_model": settings.OPENAI_EMBEDDING_MODEL,
            "dimensions": settings.PINECONE_EMBEDDING_DIMENSION,
            "status": "connected" if has_pinecone else "relational_fallback_active",
            "namespace_prefix": settings.PINECONE_NAMESPACE_PREFIX
        },
        "authentication": {
            "provider": "Better Auth",
            "endpoint": settings.BETTER_AUTH_URL,
            "status": "configured" if has_better_auth else "dev_mode_active"
        }
    }

"""
Main FastAPI Application Entrypoint
Marketing Strategy Assessment System (Consulting Framework Component)
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import logger
from app.api.v1.router import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Research-grade decision-support backend for Marketing Strategy Assessment in Sri Lankan Tech Companies.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development/demo mode allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
def root():
    return {
        "title": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "documentation": "/docs",
        "api_v1": settings.API_V1_PREFIX
    }


if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting server on {settings.BACKEND_HOST}:{settings.BACKEND_PORT}")
    uvicorn.run("app.main:app", host=settings.BACKEND_HOST, port=settings.BACKEND_PORT, reload=settings.DEBUG)

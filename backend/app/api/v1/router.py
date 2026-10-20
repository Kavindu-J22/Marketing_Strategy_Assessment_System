"""
Central API v1 Router
"""
from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.products import router as products_router
from app.api.v1.questionnaire import router as questionnaire_router
from app.api.v1.audience import router as audience_router
from app.api.v1.messages import router as messages_router
from app.api.v1.channels import router as channels_router
from app.api.v1.budget import router as budget_router
from app.api.v1.analysis import router as analysis_router
from app.api.v1.research import router as research_router
from app.api.v1.integrations import router as integrations_router

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(products_router)
api_router.include_router(questionnaire_router)
api_router.include_router(audience_router)
api_router.include_router(messages_router)
api_router.include_router(channels_router)
api_router.include_router(budget_router)
api_router.include_router(analysis_router)
api_router.include_router(research_router)
api_router.include_router(integrations_router)

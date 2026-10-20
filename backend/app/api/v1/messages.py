"""
Feature-to-Value Message Generation Endpoints (FR4)
"""
from fastapi import APIRouter, Depends
from app.schemas.messages import MessageGenerateRequest, GeneratedMessagesResult
from app.services.gemini_service import messaging_service
from app.core.security import get_current_user, AuthUser

router = APIRouter(prefix="/messages", tags=["Feature-to-Value Messages"])

@router.post("/generate", response_model=GeneratedMessagesResult)
def generate_marketing_messages(
    req: MessageGenerateRequest,
    current_user: AuthUser = Depends(get_current_user)
):
    return messaging_service.generate_messages(req)

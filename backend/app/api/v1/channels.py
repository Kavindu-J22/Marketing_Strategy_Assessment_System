"""
Marketing Channel AHP Recommendation Endpoints (FR5)
"""
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from app.schemas.channels import ChannelRankRequest, ChannelRankingResult
from app.ahp.engine import ahp_engine
from app.core.database import db
from app.core.security import get_current_user, AuthUser

router = APIRouter(prefix="/channels", tags=["Marketing Channels & AHP"])

@router.get("/catalog")
def get_channel_catalog():
    return db.list("channel_catalog")

@router.get("/criteria")
def get_ahp_criteria():
    return db.list("ahp_criteria")

@router.post("/rank", response_model=ChannelRankingResult)
def rank_channels(
    req: ChannelRankRequest,
    current_user: AuthUser = Depends(get_current_user)
):
    return ahp_engine.evaluate_channels(req)

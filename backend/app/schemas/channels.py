"""
Marketing Channel Recommendation Schemas (AHP) (FR5)
"""
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from app.schemas.common import IndustryEnum, MarketTypeEnum, TechLiteracyLevel


class ChannelRankRequest(BaseModel):
    industry: IndustryEnum
    market_type: MarketTypeEnum
    campaign_goal: str
    audience_literacy: TechLiteracyLevel
    preferred_content: List[str]
    monthly_budget_lkr: int = Field(..., ge=0)
    target_location: str
    current_channels: List[str] = Field(default_factory=list)
    prior_best_channels: List[str] = Field(default_factory=list)
    custom_criteria_weights: Optional[Dict[str, float]] = None


class ChannelRankItem(BaseModel):
    rank: int
    channel_id: str
    channel_name: str
    score_0to100: float
    criterion_contributions: Dict[str, float]
    rationale: str
    evidence_notes: List[str] = Field(default_factory=list)
    is_recommended: bool = False
    sri_lanka_reach_rate: float
    relative_cost_index: float


class ChannelRankingResult(BaseModel):
    ranked_channels: List[ChannelRankItem]
    ahp_weight_version: str
    weights_used: Dict[str, float]
    is_assumed_synthetic_weights: bool = True
    consistency_ratio: float
    is_matrix_consistent: bool = True
    evidence_citations: List[str] = Field(default_factory=list)
    method_disclaimer: str = "AHP scores represent multi-criteria alignment, NOT predicted campaign ROI."

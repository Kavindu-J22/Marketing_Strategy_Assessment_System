"""
Feature-to-Value Messaging Schemas (FR4)
"""
from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.common import TechLiteracyLevel, IndustryEnum, MarketTypeEnum


class FeatureBenefitPair(BaseModel):
    feature: str
    benefit_statement: str
    target_concern_addressed: str


class MessageGenerateRequest(BaseModel):
    product_name: str
    product_description: str
    main_features: List[str]
    industry: IndustryEnum
    market_type: MarketTypeEnum
    primary_benefit: str
    customer_pain_points: List[str]
    audience_description: str
    literacy_level: TechLiteracyLevel
    detail_preference_1to5: int = Field(default=3, ge=1, le=5)
    campaign_goal: str
    target_language: str = Field(default="en", description="'en' for English, 'si' for Sinhala")


class GeneratedMessagesResult(BaseModel):
    feature_to_benefit_map: List[FeatureBenefitPair]
    core_value_proposition: str
    simple_message: str
    balanced_message: str
    technical_message: str
    recommended_message: str
    short_headline: str
    social_caption: str
    cta: str
    rationale: str
    audience_fit: str
    claim_warnings: List[str] = Field(default_factory=list)
    source_feature_ids: List[str] = Field(default_factory=list)
    generation_model: str
    is_ai_generated: bool = True
    rubric_evaluation_status: str = "Pending real-user / expert evaluation"

"""
Audience Technical Literacy Prediction Schemas (FR3)
"""
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from app.schemas.common import TechLiteracyLevel, IndustryEnum, MarketTypeEnum, AgeGroupEnum, DataProvenanceEnum


class AudiencePredictRequest(BaseModel):
    industry: IndustryEnum
    market_type: MarketTypeEnum
    customer_role: str
    age_group: AgeGroupEnum
    location: str
    customer_audience_text: str = Field(..., min_length=5, description="Audience description or behavior text")
    technology_comfort_1to5: int = Field(..., ge=1, le=5)
    technical_terms_familiarity_1to5: int = Field(..., ge=1, le=5)
    model_preference: Optional[str] = Field(default="auto", description="'auto', 'fusion', 'tfidf_lr', 'rule'")


class AudiencePredictionResult(BaseModel):
    predicted_class: TechLiteracyLevel
    probabilities: Dict[str, float] = Field(..., description="Probability distribution across Low, Medium, High")
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    uncertainty_caveat: str
    is_abstain_recommended: bool = False
    model_type: str
    model_version: str
    dataset_provenance: DataProvenanceEnum = DataProvenanceEnum.SYNTHETIC_DEMO
    is_empirically_validated: bool = False
    reason_codes: List[str] = Field(default_factory=list)

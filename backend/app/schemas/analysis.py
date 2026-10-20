"""
End-to-End Analysis Run and Comprehensive Strategy Report Schemas (FR7)
"""
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from app.schemas.common import DataProvenanceEnum
from app.schemas.audience import AudiencePredictionResult
from app.schemas.messages import GeneratedMessagesResult
from app.schemas.channels import ChannelRankingResult
from app.schemas.budget import BudgetAllocationResult


class AnalysisRunInitRequest(BaseModel):
    product_id: str
    campaign_id: Optional[str] = None
    questionnaire_response_id: Optional[str] = None
    data_provenance: DataProvenanceEnum = DataProvenanceEnum.SYNTHETIC_DEMO
    model_preference: Optional[str] = "auto"
    custom_criteria_weights: Optional[Dict[str, float]] = None


class ComprehensiveStrategyReport(BaseModel):
    run_id: str
    organization_id: str
    product_id: str
    campaign_id: Optional[str]
    created_at: str
    completed_at: Optional[str]
    status: str
    data_provenance: DataProvenanceEnum
    input_summary: Dict[str, Any]
    audience: AudiencePredictionResult
    feature_value_messages: GeneratedMessagesResult
    channels: ChannelRankingResult
    budget: BudgetAllocationResult
    caveats: List[str] = Field(default_factory=list)
    source_citations: List[Dict[str, Any]] = Field(default_factory=list)
    evaluation_status: str = "Not yet empirically validated"
    integration_schema_version: str = "v1.0-SL-2026"

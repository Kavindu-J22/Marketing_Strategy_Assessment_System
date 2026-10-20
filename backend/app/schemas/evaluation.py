"""
Research Evaluation, SUS, and Expert Review Schemas (NFR1, NFR3)
"""
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class SUSSubmissionRequest(BaseModel):
    q1_freq: int = Field(..., ge=1, le=5, description="1. I think that I would like to use this system frequently.")
    q2_complex: int = Field(..., ge=1, le=5, description="2. I found the system unnecessarily complex.")
    q3_easy: int = Field(..., ge=1, le=5, description="3. I thought the system was easy to use.")
    q4_tech_support: int = Field(..., ge=1, le=5, description="4. I think that I would need the support of a technical person to be able to use this system.")
    q5_integrated: int = Field(..., ge=1, le=5, description="5. I found the various functions in this system were well integrated.")
    q6_inconsistency: int = Field(..., ge=1, le=5, description="6. I thought there was too much inconsistency in this system.")
    q7_learn_quick: int = Field(..., ge=1, le=5, description="7. I would imagine that most people would learn to use this system very quickly.")
    q8_cumbersome: int = Field(..., ge=1, le=5, description="8. I found the system very cumbersome to use.")
    q9_confident: int = Field(..., ge=1, le=5, description="9. I felt very confident using the system.")
    q10_learn_lot: int = Field(..., ge=1, le=5, description="10. I needed to learn a lot of things before I could get going with this system.")
    feedback: Optional[str] = None


class SUSScoreResult(BaseModel):
    sus_score: float = Field(..., ge=0.0, le=100.0)
    grade: str # A+, A, B, C, D, F
    adjective_rating: str # Excellent, Good, OK, Poor
    is_acceptable: bool # True if score >= 68 (standard Brooke SUS cutoff)
    submission_id: str


class ExpertReviewSubmission(BaseModel):
    run_id: str
    clarity_1to5: int = Field(..., ge=1, le=5)
    relevance_1to5: int = Field(..., ge=1, le=5)
    accuracy_1to5: int = Field(..., ge=1, le=5)
    customer_orientation_1to5: int = Field(..., ge=1, le=5)
    detail_level_1to5: int = Field(..., ge=1, le=5)
    channel_agreement_1to5: int = Field(..., ge=1, le=5)
    budget_agreement_1to5: int = Field(..., ge=1, le=5)
    qualitative_notes: Optional[str] = None


class EvaluationOverviewResponse(BaseModel):
    synthetic_models: List[Dict[str, Any]]
    real_validation_status: str = "Pending independent empirical data collection"
    sus_summary: Dict[str, Any]
    expert_review_summary: Dict[str, Any]
    limitations: List[str]

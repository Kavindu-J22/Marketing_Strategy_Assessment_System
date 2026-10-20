"""
Research Evaluation, Usability (SUS), and Expert Review Endpoints (NFR1, NFR3)
"""
from typing import Dict, Any, List, Optional, Tuple
import os
import json
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.evaluation import (
    SUSSubmissionRequest,
    SUSScoreResult,
    ExpertReviewSubmission,
    EvaluationOverviewResponse
)
from app.core.database import db
from app.core.security import get_current_user, AuthUser

router = APIRouter(prefix="/research", tags=["Research & Evaluation"])


def calculate_sus_score(req: SUSSubmissionRequest) -> Tuple[float, str, str, bool]:
    # System Usability Scale (Brooke, 1996):
    # Odd items (1, 3, 5, 7, 9): score - 1
    # Even items (2, 4, 6, 8, 10): 5 - score
    # Multiply total sum by 2.5 to scale 0 - 100
    pos_sum = (req.q1_freq - 1) + (req.q3_easy - 1) + (req.q5_integrated - 1) + (req.q7_learn_quick - 1) + (req.q9_confident - 1)
    neg_sum = (5 - req.q2_complex) + (5 - req.q4_tech_support) + (5 - req.q6_inconsistency) + (5 - req.q8_cumbersome) + (5 - req.q10_learn_lot)
    score = (pos_sum + neg_sum) * 2.5
    score = round(score, 1)

    if score >= 80.3:
        grade = "A"
        adj = "Excellent"
    elif score >= 68.0:
        grade = "B"
        adj = "Good"
    elif score >= 51.0:
        grade = "C"
        adj = "OK"
    else:
        grade = "D/F"
        adj = "Poor"

    is_acceptable = (score >= 68.0)
    return score, grade, adj, is_acceptable


@router.post("/sus", response_model=SUSScoreResult)
def submit_sus_survey(
    req: SUSSubmissionRequest,
    current_user: AuthUser = Depends(get_current_user)
):
    score, grade, adj, acceptable = calculate_sus_score(req)
    sub_id = f"sus-{uuid.uuid4().hex[:10]}"
    
    db.insert("usability_responses", {
        "id": sub_id,
        "user_id": current_user.user_id,
        "organization_id": current_user.organization_id,
        "responses": req.model_dump(),
        "sus_score": score,
        "grade": grade,
        "adjective_rating": adj,
        "is_acceptable": acceptable,
        "feedback": req.feedback,
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    return SUSScoreResult(
        sus_score=score,
        grade=grade,
        adjective_rating=adj,
        is_acceptable=acceptable,
        submission_id=sub_id
    )


@router.get("/sus")
def get_sus_summary():
    responses = db.list("usability_responses")
    if not responses:
        return {
            "total_responses": 0,
            "mean_sus_score": 0.0,
            "status": "No user usability evaluations recorded yet"
        }
    
    scores = [r.get("sus_score", 0.0) for r in responses]
    mean_score = round(sum(scores) / len(scores), 1)
    return {
        "total_responses": len(responses),
        "mean_sus_score": mean_score,
        "grade": "Good" if mean_score >= 68.0 else "Below Average",
        "benchmark_cutoff": 68.0,
        "target_met": mean_score >= 70.0
    }


@router.post("/expert-review")
def submit_expert_review(
    req: ExpertReviewSubmission,
    current_user: AuthUser = Depends(get_current_user)
):
    rev_id = f"rev-{uuid.uuid4().hex[:10]}"
    db.insert("expert_reviews", {
        "id": rev_id,
        "run_id": req.run_id,
        "expert_user_id": current_user.user_id,
        "clarity_1to5": req.clarity_1to5,
        "relevance_1to5": req.relevance_1to5,
        "accuracy_1to5": req.accuracy_1to5,
        "customer_orientation_1to5": req.customer_orientation_1to5,
        "detail_level_1to5": req.detail_level_1to5,
        "channel_agreement_1to5": req.channel_agreement_1to5,
        "budget_agreement_1to5": req.budget_agreement_1to5,
        "qualitative_notes": req.qualitative_notes,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    return {"status": "recorded", "review_id": rev_id}


@router.get("/evaluation")
def get_evaluation_overview():
    # Load actual measured baseline and fusion metrics
    fusion_metrics = {}
    baseline_metrics = {}

    if os.path.exists("ml/evaluation/fusion_metrics.json"):
        with open("ml/evaluation/fusion_metrics.json", "r") as f:
            fusion_metrics = json.load(f)

    if os.path.exists("ml/evaluation/baseline_metrics.json"):
        with open("ml/evaluation/baseline_metrics.json", "r") as f:
            baseline_metrics = json.load(f)

    sus_res = get_sus_summary()
    expert_reviews = db.list("expert_reviews")

    return {
        "dataset_provenance": "100% Synthetic / Simulated (N=5,000, 1,000 fictional companies)",
        "empirical_validation_status": "Not yet empirically validated with field data",
        "synthetic_models": {
            "selected_multimodal_fusion": fusion_metrics,
            "baselines": baseline_metrics
        },
        "sus_summary": sus_res,
        "expert_review_summary": {
            "total_expert_reviews": len(expert_reviews),
            "status": "Awaiting external domain expert reviews" if not expert_reviews else "In Review"
        },
        "limitations": [
            "The 5,000 dataset records are entirely synthetic simulations with no primary surveyed respondents.",
            "Test accuracy (90.6%) reflects consistency with the synthetic generator's logic, not verified market truth.",
            "Initial AHP weights (34%, 25%, 18%, 13%, 10%) are assumed demo heuristics, not expert-validated.",
            "Budget proxy utility optimization measures constraint efficiency, not financial ROI."
        ]
    }


@router.get("/sources")
def get_market_sources():
    return db.list("market_sources")

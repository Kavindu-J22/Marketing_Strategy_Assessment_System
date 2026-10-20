"""
Unit tests for Audience Classifier Inference (FR3)
"""
import pytest
from app.ml.inference import classifier_service, rule_baseline
from app.schemas.audience import AudiencePredictRequest
from app.schemas.common import IndustryEnum, MarketTypeEnum, AgeGroupEnum, TechLiteracyLevel


def test_rule_baseline_thresholds():
    # Sum <= 4 -> Low
    assert rule_baseline(1, 1) == "Low"
    assert rule_baseline(2, 2) == "Low"
    assert rule_baseline(3, 1) == "Low"
    
    # Sum 5, 6, 7 -> Medium
    assert rule_baseline(1, 4) == "Medium"
    assert rule_baseline(3, 3) == "Medium"
    assert rule_baseline(4, 3) == "Medium"
    
    # Sum >= 8 -> High
    assert rule_baseline(4, 4) == "High"
    assert rule_baseline(5, 3) == "High"
    assert rule_baseline(5, 5) == "High"


def test_classifier_service_fusion_or_fallback():
    req = AudiencePredictRequest(
        industry=IndustryEnum.SOFTWARE_SAAS,
        market_type=MarketTypeEnum.B2B,
        customer_role="IT professional",
        age_group=AgeGroupEnum.AGE_25_34,
        location="Colombo",
        customer_audience_text="IT professionals and software engineers building cloud microservices and APIs",
        technology_comfort_1to5=5,
        technical_terms_familiarity_1to5=5,
        model_preference="auto"
    )
    res = classifier_service.predict(req)
    assert res.predicted_class in [TechLiteracyLevel.LOW, TechLiteracyLevel.MEDIUM, TechLiteracyLevel.HIGH]
    assert 0.0 <= res.confidence_score <= 1.0
    # Probabilities sum to ~1.0
    prob_sum = sum(res.probabilities.values())
    assert abs(prob_sum - 1.0) < 0.05
    assert res.is_empirically_validated is False
    assert "synthetic" in res.uncertainty_caveat.lower()

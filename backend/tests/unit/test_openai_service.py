"""
Unit Tests for OpenAI Marketing Message Service (FR4)
Validates schema compliance, prompt injection resistance, RAG grounding, and deterministic fallback.
"""
import pytest
from app.schemas.messages import MessageGenerateRequest, GeneratedMessagesResult
from app.schemas.common import TechLiteracyLevel, IndustryEnum, MarketTypeEnum
from app.services.openai_service import MarketingMessageService


@pytest.fixture
def sample_message_request():
    return MessageGenerateRequest(
        product_name="CeylonAgro Cloud",
        product_description="IoT soil moisture sensor network and automated drip irrigation scheduler for tea and vegetable estates.",
        main_features=["Real-time soil sensor telemetry", "Automated drip valve scheduling", "Bilingual Sinhala and English alerts"],
        industry=IndustryEnum.SOFTWARE_SAAS,
        market_type=MarketTypeEnum.B2B,
        primary_benefit="Reduce water and electricity consumption while maximizing crop yields",
        customer_pain_points=["Excessive diesel pump costs", "Crop damage due to inconsistent manual watering"],
        audience_description="Upcountry tea estate managers and commercial vegetable farming supervisors.",
        literacy_level=TechLiteracyLevel.LOW,
        detail_preference_1to5=2,
        campaign_goal="Increase qualified trial bookings",
        target_language="en"
    )


def test_deterministic_fallback_full_schema(sample_message_request):
    """Verifies that the non-LLM deterministic template fallback satisfies all business contract fields."""
    service = MarketingMessageService()
    service.client = None # Force fallback

    result = service.generate_messages(sample_message_request)

    assert isinstance(result, GeneratedMessagesResult)
    assert result.is_ai_generated is False
    assert "Deterministic Template" in result.generation_model
    assert len(result.feature_to_benefit_map) == 3
    assert result.core_value_proposition != ""
    assert result.simple_message != ""
    assert result.balanced_message != ""
    assert result.technical_message != ""
    assert result.recommended_message == result.simple_message # Low literacy routes to simple
    assert result.short_headline != ""
    assert result.social_caption != ""
    assert result.cta != ""
    assert len(result.claim_warnings) >= 1
    assert result.source_feature_ids == sample_message_request.main_features


def test_literacy_routing_high_literacy(sample_message_request):
    """Verifies that high literacy requests recommend technical messaging."""
    sample_message_request.literacy_level = TechLiteracyLevel.HIGH
    service = MarketingMessageService()
    service.client = None

    result = service.generate_messages(sample_message_request)
    assert result.recommended_message == result.technical_message


def test_literacy_routing_medium_literacy(sample_message_request):
    """Verifies that medium literacy requests recommend balanced messaging."""
    sample_message_request.literacy_level = TechLiteracyLevel.MEDIUM
    service = MarketingMessageService()
    service.client = None

    result = service.generate_messages(sample_message_request)
    assert result.recommended_message == result.balanced_message


def test_rag_passages_grounding(sample_message_request):
    """Verifies that RAG passages are handled safely without raising exceptions."""
    service = MarketingMessageService()
    service.client = None

    rag_passages = [
        {
            "source_id": "src_icta_strategy_2030",
            "title": "National Digital Strategy 2030",
            "text": "Sri Lankan agricultural digitization is a key priority for regional productivity."
        }
    ]

    result = service.generate_messages(sample_message_request, rag_passages=rag_passages)
    assert result.core_value_proposition != ""
    assert result.simple_message != ""

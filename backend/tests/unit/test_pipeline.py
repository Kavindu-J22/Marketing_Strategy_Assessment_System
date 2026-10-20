"""
Unit tests for End-to-End Analysis Pipeline Orchestration (FR7)
"""
import pytest
from app.services.analysis_service import analysis_orchestrator
from app.schemas.questionnaire import (
    FullQuestionnaireSubmission,
    QuestionnaireStep1Product,
    QuestionnaireStep2Audience,
    QuestionnaireStep3Literacy,
    QuestionnaireStep4ValueChannels,
    QuestionnaireStep5BudgetGoals
)
from app.schemas.common import (
    IndustryEnum,
    MarketTypeEnum,
    AgeGroupEnum,
    BudgetFlexibilityEnum,
    CampaignDurationEnum,
    DataProvenanceEnum
)


def test_full_pipeline_orchestration_run():
    submission = FullQuestionnaireSubmission(
        step1=QuestionnaireStep1Product(
            q1_product_name="Ceytra CRM Pro",
            q2_product_description="Customer relationship management software with lead scoring, pipeline analytics, and multi-channel communication.",
            q3_main_features=["Lead pipeline tracking", "Automated email follow-ups", "Sales forecasting dashboard"],
            q4_industry=IndustryEnum.SOFTWARE_SAAS
        ),
        step2=QuestionnaireStep2Audience(
            q5_primary_target_customer="SME sales directors and tech startup business founders in Sri Lanka.",
            q6_market_type=MarketTypeEnum.B2B,
            q7_target_age_group=AgeGroupEnum.AGE_25_34,
            q8_customer_occupation=["Business owner", "Manager"],
            q9_target_location="Western Province"
        ),
        step3=QuestionnaireStep3Literacy(
            q10_technology_comfort="Medium - They are comfortable with common digital tools and applications.",
            q10_score=3,
            q11_technical_terms_familiarity="Moderately familiar",
            q11_score=3,
            q12_message_detail_preference="Balanced technical and simple language",
            q12_score=3
        ),
        step4=QuestionnaireStep4ValueChannels(
            q13_main_customer_benefit="Close deals faster with structured pipeline visibility and automated follow-ups.",
            q14_actual_customer_pain_points=["Difficulty tracking customers", "Inconsistent reporting"],
            q15_current_marketing_channels=["LinkedIn", "Email Marketing", "Website/SEO"],
            q16_prior_best_channels=["LinkedIn"],
            q17_preferred_content=["Case studies", "Product demonstrations"]
        ),
        step5=QuestionnaireStep5BudgetGoals(
            q18_monthly_marketing_budget_LKR=75000,
            q19_budget_flexibility=BudgetFlexibilityEnum.MODERATELY,
            q20_campaign_duration=CampaignDurationEnum.THREE_MONTHS,
            q21_success_definition=["More leads"]
        )
    )

    report = analysis_orchestrator.run_pipeline(
        submission=submission,
        user_id="test-user-001",
        organization_id="org-ceylontech-001",
        provenance=DataProvenanceEnum.SYNTHETIC_DEMO
    )

    assert report.run_id.startswith("run-")
    assert report.status == "completed"
    assert report.audience.predicted_class is not None
    assert report.feature_value_messages.core_value_proposition != ""
    assert len(report.channels.ranked_channels) == 8
    assert report.budget.exact_sum_verified is True
    assert sum(a.monthly_lkr for a in report.budget.allocations) + report.budget.reserve_monthly_lkr == 75000
    assert report.integration_schema_version == "v1.0-SL-2026"

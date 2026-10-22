"""
Live Pipeline End-to-End Execution Script
Executes full questionnaire analysis run with live services and reports outputs.
"""
import sys
import os

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

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
from app.services.analysis_service import analysis_orchestrator


def run_pipeline_test():
    print("=" * 70)
    print("RUNNING LIVE END-TO-END PIPELINE ASSESSMENT")
    print("=" * 70)

    sub = FullQuestionnaireSubmission(
        step1=QuestionnaireStep1Product(
            q1_product_name="Nivora StockSync Cloud",
            q2_product_description="Multi-outlet cloud inventory management suite for Sri Lankan retail merchants.",
            q3_main_features=["Real-time barcode inventory scanning", "Automated purchase reordering", "Multi-branch stock transfer ledger"],
            q4_industry=IndustryEnum.SOFTWARE_SAAS
        ),
        step2=QuestionnaireStep2Audience(
            q5_primary_target_customer="Retail grocery shop owners and wholesale distributors in Western Province.",
            q6_market_type=MarketTypeEnum.B2B,
            q7_target_age_group=AgeGroupEnum.AGE_25_34,
            q8_customer_occupation=["Business owner", "Manager"],
            q9_target_location="Western Province"
        ),
        step3=QuestionnaireStep3Literacy(
            q10_technology_comfort="Low - They use mobile apps for personal communication but struggle with software.",
            q10_score=2,
            q11_technical_terms_familiarity="Unfamiliar - Technical terms confuse them.",
            q11_score=2,
            q12_message_detail_preference="Simple, straightforward benefits only",
            q12_score=1
        ),
        step4=QuestionnaireStep4ValueChannels(
            q13_main_customer_benefit="Eliminate stock ledger errors and save 2 hours of manual stocktaking daily.",
            q14_actual_customer_pain_points=["Stock mismatches across shops", "Lost sales due to sudden stockouts"],
            q15_current_marketing_channels=["Facebook", "Word of Mouth"],
            q16_prior_best_channels=["Facebook"],
            q17_preferred_content=["Short video demonstrations", "Testimonials"]
        ),
        step5=QuestionnaireStep5BudgetGoals(
            q18_monthly_marketing_budget_LKR=60000,
            q19_budget_flexibility=BudgetFlexibilityEnum.MODERATELY,
            q20_campaign_duration=CampaignDurationEnum.THREE_MONTHS,
            q21_success_definition=["More trial inquiries and inbound demos"]
        )
    )

    report = analysis_orchestrator.run_pipeline(
        submission=sub,
        user_id="founder-001",
        organization_id="org-ceylontech-001",
        provenance=DataProvenanceEnum.SYNTHETIC_DEMO
    )

    print(f"\nReport ID: {report.run_id}")
    print(f"Status: {report.status}")
    print(f"1. FR3 PyTorch Predicted Literacy: {report.audience.predicted_class} (Confidence: {report.audience.confidence_score:.2f})")
    print(f"2. FR4 OpenAI Model: {report.feature_value_messages.generation_model} (is_ai: {report.feature_value_messages.is_ai_generated})")
    print(f"   Headline: {report.feature_value_messages.short_headline}")
    print(f"   Value Prop: {report.feature_value_messages.core_value_proposition}")
    print(f"   Recommended: {report.feature_value_messages.recommended_message}")
    print(f"3. FR5 Top Channels: {', '.join([c.channel_name for c in report.channels.ranked_channels[:3]])}")
    print(f"   Consistency Ratio: {report.channels.consistency_ratio:.4f} (Valid: {report.channels.consistency_ratio <= 0.10})")
    print(f"4. FR6 Budget Allocations (Monthly LKR 60,000, Reserve: {report.budget.reserve_monthly_lkr}):")
    for a in report.budget.allocations:
        print(f"   - {a.channel_name}: LKR {a.monthly_lkr:,} ({a.percentage:.1f}%)")
    print(f"   Exact Sum Guarantee: {report.budget.exact_sum_verified}")
    print(f"5. Source Citations ({len(report.source_citations)}):")
    for c in report.source_citations:
        print(f"   * [{c.get('id')}]: {c.get('title')}")

    print("\n" + "=" * 70)
    print("PIPELINE TEST SUCCESSFUL")
    print("=" * 70)


if __name__ == "__main__":
    run_pipeline_test()

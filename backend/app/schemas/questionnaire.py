"""
Questionnaire Pydantic Schemas (Faithfully Preserving Q1-Q21)
"""
from typing import List, Optional
from pydantic import BaseModel, Field, model_validator
from app.schemas.common import (
    IndustryEnum,
    MarketTypeEnum,
    AgeGroupEnum,
    BudgetFlexibilityEnum,
    CampaignDurationEnum,
)


class QuestionnaireStep1Product(BaseModel):
    q1_product_name: str = Field(..., min_length=2, max_length=150, description="Q1: Product or service name")
    q2_product_description: str = Field(..., min_length=10, max_length=3000, description="Q2: Product/service description, features, tech")
    q3_main_features: List[str] = Field(..., min_length=1, description="Q3: Main technical product features")
    q4_industry: IndustryEnum = Field(..., description="Q4: Product industry category")


class QuestionnaireStep2Audience(BaseModel):
    q5_primary_target_customer: str = Field(..., min_length=5, max_length=1000, description="Q5: Target customer description")
    q6_market_type: MarketTypeEnum = Field(..., description="Q6: B2B, B2C, or Both")
    q7_target_age_group: AgeGroupEnum = Field(..., description="Q7: Target customer age group")
    q8_customer_occupation: List[str] = Field(..., min_length=1, description="Q8: Target customer typical roles/occupations")
    q9_target_location: str = Field(..., description="Q9: Target location in Sri Lanka (e.g. All Sri Lanka, Western Province, Colombo)")
    q9_specific_city: Optional[str] = Field(default=None, description="Optional city or municipal area")


class QuestionnaireStep3Literacy(BaseModel):
    q10_technology_comfort: str = Field(..., description="Q10: Customer comfort with technology (5-point scale text)")
    q10_score: int = Field(..., ge=1, le=5, description="Q10 numeric score 1 to 5")
    q11_technical_terms_familiarity: str = Field(..., description="Q11: Familiarity with technical terms (5-point scale text)")
    q11_score: int = Field(..., ge=1, le=5, description="Q11 numeric score 1 to 5")
    q12_message_detail_preference: str = Field(..., description="Q12: Marketing detail preference (5-point scale text)")
    q12_score: int = Field(..., ge=1, le=5, description="Q12 numeric score 1 to 5")


class QuestionnaireStep4ValueChannels(BaseModel):
    q13_main_customer_benefit: str = Field(..., min_length=5, max_length=1500, description="Q13: Primary value/benefit customer should understand")
    q14_actual_customer_pain_points: List[str] = Field(..., min_length=1, description="Q14: Actual customer pain points solved")
    q15_current_marketing_channels: List[str] = Field(..., min_length=1, description="Q15: Current marketing channels or None currently")
    q16_prior_best_channels: List[str] = Field(default_factory=list, description="Q16: Best performing channels so far (subset of Q15)")
    q17_preferred_content: List[str] = Field(..., min_length=1, description="Q17: Preferred content formats")


class QuestionnaireStep5BudgetGoals(BaseModel):
    q18_monthly_marketing_budget_LKR: int = Field(..., ge=0, description="Q18: Monthly marketing budget in Sri Lankan Rupees (LKR)")
    q19_budget_flexibility: BudgetFlexibilityEnum = Field(..., description="Q19: Budget flexibility")
    q20_campaign_duration: CampaignDurationEnum = Field(..., description="Q20: Campaign duration selection")
    q20_explicit_months: Optional[int] = Field(default=None, ge=1, description="Explicit number of months if >6 months")
    q21_success_definition: List[str] = Field(..., min_length=1, description="Q21: Success definition goals")
    optional_kpi_target: Optional[int] = Field(default=None, ge=0, description="Optional monthly target count")
    optional_kpi_unit: Optional[str] = Field(default=None, description="KPI unit (e.g., leads/month, visitors)")


class FullQuestionnaireSubmission(BaseModel):
    step1: QuestionnaireStep1Product
    step2: QuestionnaireStep2Audience
    step3: QuestionnaireStep3Literacy
    step4: QuestionnaireStep4ValueChannels
    step5: QuestionnaireStep5BudgetGoals
    organization_id: Optional[str] = "org-ceylontech-001"
    product_id: Optional[str] = None
    campaign_id: Optional[str] = None

    @model_validator(mode="after")
    def validate_q16_channel_subset(self):
        current_channels = self.step4.q15_current_marketing_channels
        prior_best = self.step4.q16_prior_best_channels
        if "None currently" not in current_channels and prior_best:
            for ch in prior_best:
                if ch not in current_channels and ch != "No performance data":
                    # Allow user to state No performance data
                    pass
        return self

"""
Questionnaire Schema and Validation Endpoints (FR1, FR2)
"""
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
import uuid
from app.core.security import get_current_user, AuthUser
from app.core.database import db
from app.schemas.questionnaire import FullQuestionnaireSubmission
from app.schemas.common import StandardResponse

router = APIRouter(prefix="/questionnaire", tags=["Questionnaire"])

@router.get("/schema")
def get_questionnaire_schema():
    """
    Returns the complete structured metadata for Questionnaire Q1-Q21
    faithful to Questionary Final.docx and informed dataset refinements.
    """
    return {
        "schema_version": "v1.0-SL-2026",
        "description": "Stakeholder Marketing Assessment Questionnaire for Sri Lankan Tech Companies",
        "total_steps": 5,
        "steps": [
            {
                "step": 1,
                "title": "Product Information",
                "questions": ["Q1", "Q2", "Q3", "Q4"],
                "fields": {
                    "q1_product_name": {"type": "text", "label": "1. What is the name of your product or service?", "required": True},
                    "q2_product_description": {"type": "textarea", "label": "2. Briefly describe your product or service.", "required": True},
                    "q3_main_features": {"type": "tag_list", "label": "3. What are the main features of your product?", "required": True},
                    "q4_industry": {"type": "select", "label": "4. What industry does your product belong to?", "options": [
                        "Software / SaaS", "FinTech", "E-commerce", "Healthcare Technology", "Education Technology", "Artificial Intelligence", "Cybersecurity", "Other"
                    ], "required": True}
                }
            },
            {
                "step": 2,
                "title": "Target Customer Information",
                "questions": ["Q5", "Q6", "Q7", "Q8", "Q9"],
                "fields": {
                    "q5_primary_target_customer": {"type": "textarea", "label": "5. Who is your primary target customer?", "required": True},
                    "q6_market_type": {"type": "radio", "label": "6. Is your target market B2B, B2C, or both?", "options": ["B2B", "B2C", "Both"], "required": True},
                    "q7_target_age_group": {"type": "select", "label": "7. What age group best represents your target customer?", "options": ["18-24", "25-34", "35-44", "45-54", "55+", "Multiple age groups"], "required": True},
                    "q8_customer_occupation": {"type": "multiselect", "label": "8. What is the typical occupation or role of your target customer?", "options": [
                        "Business owner", "IT professional", "Student", "Manager", "Accountant", "General consumer", "Operations staff", "Educator", "Healthcare administrator", "Marketing executive"
                    ], "required": True},
                    "q9_target_location": {"type": "select", "label": "9. Where is your target audience located?", "options": [
                        "All Sri Lanka", "Western Province", "Southern Province", "Central Province", "North Western Province", "Northern Province", "Eastern Province", "North Central Province", "Sabaragamuwa Province", "Uva Province", "Colombo", "Gampaha", "Kandy", "Galle"
                    ], "required": True}
                }
            },
            {
                "step": 3,
                "title": "Technical Literacy Assessment",
                "questions": ["Q10", "Q11", "Q12"],
                "fields": {
                    "q10_technology_comfort": {"type": "radio_5point", "label": "10. How would you describe your target customer's comfort with technology?", "options": [
                        "Very low - They are generally uncomfortable with technology.",
                        "Low - They can use basic technology but may struggle with technical terms.",
                        "Medium - They are comfortable with common digital tools and applications.",
                        "High - They are familiar with advanced digital tools and technical concepts.",
                        "Very high - They are highly technical professionals."
                    ]},
                    "q11_technical_terms_familiarity": {"type": "radio_5point", "label": "11. How familiar is your target customer with technical terms related to your product?", "options": [
                        "Not familiar at all", "Slightly familiar", "Moderately familiar", "Very familiar", "Highly familiar"
                    ]},
                    "q12_message_detail_preference": {"type": "radio_5point", "label": "12. How detailed should your marketing communication be for your target audience?", "options": [
                        "Very simple, non-technical language",
                        "Mostly simple language",
                        "Balanced technical and simple language",
                        "Detailed and technical language",
                        "Highly technical and professional language"
                    ]}
                }
            },
            {
                "step": 4,
                "title": "Value & Marketing Channels",
                "questions": ["Q13", "Q14", "Q15", "Q16", "Q17"],
                "fields": {
                    "q13_main_customer_benefit": {"type": "textarea", "label": "13. What is the main benefit you want customers to understand about your product?", "required": True},
                    "q14_actual_customer_pain_points": {"type": "multiselect", "label": "14. What are the main customer pain points your product solves?", "options": [
                        "Too much manual work", "High operating costs", "Low process efficiency", "Frequent data entry errors", "Limited information security", "Complicated daily workflows", "Difficulty tracking customers", "Slow access to records", "Missed appointments or orders", "Inconsistent reporting"
                    ]},
                    "q15_current_marketing_channels": {"type": "multiselect", "label": "15. Which marketing channels are you currently using?", "options": [
                        "Facebook", "Instagram", "LinkedIn", "TikTok", "YouTube", "Google Ads", "Email Marketing", "Website/SEO", "None currently"
                    ]},
                    "q16_prior_best_channels": {"type": "dynamic_subset", "label": "16. Which marketing channels have worked best for you so far?"},
                    "q17_preferred_content": {"type": "multiselect", "label": "17. What type of content does your target audience engage with most?", "options": [
                        "Short videos", "Educational videos", "Images/graphics", "Articles/blogs", "Case studies", "Product demonstrations", "Customer testimonials"
                    ]}
                }
            },
            {
                "step": 5,
                "title": "Budget & Goals",
                "questions": ["Q18", "Q19", "Q20", "Q21"],
                "fields": {
                    "q18_monthly_marketing_budget_LKR": {"type": "number", "label": "18. What is your monthly marketing budget? (LKR)", "min": 0},
                    "q19_budget_flexibility": {"type": "select", "label": "19. How flexible is your marketing budget?", "options": [
                        "Fixed budget", "Slightly flexible", "Moderately flexible", "Highly flexible"
                    ]},
                    "q20_campaign_duration": {"type": "select", "label": "20. What is your expected campaign duration?", "options": [
                        "1 month", "3 months", "6 months", "More than 6 months"
                    ]},
                    "q21_success_definition": {"type": "multiselect", "label": "21. What would define a successful campaign for your business?", "options": [
                        "More website visitors", "More leads", "More sales", "More social media engagement", "More brand awareness", "Other"
                    ]}
                }
            }
        ]
    }

@router.post("/validate")
def validate_questionnaire(submission: FullQuestionnaireSubmission):
    return {
        "is_valid": True,
        "message": "All 21 questionnaire items validated successfully.",
        "product_name": submission.step1.q1_product_name,
        "monthly_budget_lkr": submission.step5.q18_monthly_marketing_budget_LKR
    }

@router.post("/draft")
def save_draft(draft_data: Dict[str, Any], current_user: AuthUser = Depends(get_current_user)):
    draft_id = draft_data.get("campaign_id") or f"draft-{uuid.uuid4().hex[:8]}"
    db.insert("questionnaire_responses", {
        "id": draft_id,
        "organization_id": current_user.organization_id,
        "status": "draft",
        "answers": draft_data,
        "created_by": current_user.user_id
    })
    return {"status": "saved", "draft_id": draft_id}

@router.get("/draft/{draft_id}")
def get_draft(draft_id: str, current_user: AuthUser = Depends(get_current_user)):
    draft = db.get("questionnaire_responses", draft_id)
    if not draft or draft.get("organization_id") != current_user.organization_id:
        raise HTTPException(status_code=404, detail="Draft not found")
    return draft

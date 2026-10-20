"""
Shared Base Enums and Common Pydantic Schemas
"""
from enum import Enum
from typing import Optional, List, Any
from pydantic import BaseModel, Field

class IndustryEnum(str, Enum):
    SOFTWARE_SAAS = "Software / SaaS"
    FINTECH = "FinTech"
    ECOMMERCE = "E-commerce"
    HEALTHCARE_TECH = "Healthcare Technology"
    EDUCATION_TECH = "Education Technology"
    AI = "Artificial Intelligence"
    CYBERSECURITY = "Cybersecurity"
    OTHER = "Other"

class MarketTypeEnum(str, Enum):
    B2B = "B2B"
    B2C = "B2C"
    BOTH = "Both"

class AgeGroupEnum(str, Enum):
    AGE_18_24 = "18-24"
    AGE_25_34 = "25-34"
    AGE_35_44 = "35-44"
    AGE_45_54 = "45-54"
    AGE_55_PLUS = "55+"
    MULTIPLE = "Multiple age groups"

class TechLiteracyLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

class BudgetFlexibilityEnum(str, Enum):
    FIXED = "Fixed budget"
    SLIGHTLY = "Slightly flexible"
    MODERATELY = "Moderately flexible"
    HIGHLY = "Highly flexible"

class CampaignDurationEnum(str, Enum):
    ONE_MONTH = "1 month"
    THREE_MONTHS = "3 months"
    SIX_MONTHS = "6 months"
    MORE_THAN_SIX = "More than 6 months"

class DataProvenanceEnum(str, Enum):
    SYNTHETIC_DEMO = "synthetic_demo"
    REAL_COLLECTED = "real_collected"
    EXPERT_VALIDATED = "expert_validated"

class StandardResponse(BaseModel):
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[Any] = None

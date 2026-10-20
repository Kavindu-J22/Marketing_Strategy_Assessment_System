"""
Budget Allocation Schemas (FR6)
"""
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from app.schemas.common import BudgetFlexibilityEnum


class ChannelAllocationDetail(BaseModel):
    channel_id: str
    channel_name: str
    monthly_lkr: int = Field(..., ge=0)
    total_campaign_lkr: int = Field(..., ge=0)
    percentage: float = Field(..., ge=0.0, le=100.0)
    floor_lkr: int = 0
    cap_lkr: int = 0
    channel_score: float
    rationale: str


class BudgetAllocateRequest(BaseModel):
    monthly_budget_lkr: int = Field(..., ge=0, description="Monthly marketing budget in LKR")
    campaign_months: int = Field(..., ge=1, description="Campaign duration in months")
    budget_flexibility: BudgetFlexibilityEnum = BudgetFlexibilityEnum.MODERATELY
    prioritized_channels: List[Dict[str, Any]] = Field(..., min_length=1, description="Top ranked channels from AHP")
    channel_exclusions: List[str] = Field(default_factory=list)
    reserve_percentage: float = Field(default=0.0, ge=0.0, le=0.30, description="Optional contingency reserve (0-30%)")
    custom_floors: Optional[Dict[str, int]] = None
    custom_caps: Optional[Dict[str, int]] = None


class BudgetAllocationResult(BaseModel):
    monthly_budget_lkr: int
    campaign_months: int
    total_budget_lkr: int
    reserve_monthly_lkr: int
    reserve_total_lkr: int
    allocations: List[ChannelAllocationDetail]
    baseline_equal_allocations: List[ChannelAllocationDetail]
    proxy_utility_score: float
    exact_sum_verified: bool
    optimization_status: str
    method_disclaimer: str = "Proxy utility measures multi-criteria budget efficiency, NOT guaranteed monetary return."

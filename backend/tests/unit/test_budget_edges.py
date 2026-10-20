"""
Unit tests for Budget Allocation Constraints and Edge Cases (FR6)
"""
import pytest
from app.budget.optimizer import budget_optimizer
from app.schemas.budget import BudgetAllocateRequest
from app.schemas.common import BudgetFlexibilityEnum


def test_zero_budget_allocation():
    req = BudgetAllocateRequest(
        monthly_budget_lkr=0,
        campaign_months=3,
        prioritized_channels=[
            {"channel_id": "Facebook", "channel_name": "Facebook", "score_0to100": 85.0},
            {"channel_id": "LinkedIn", "channel_name": "LinkedIn", "score_0to100": 75.0}
        ]
    )
    res = budget_optimizer.allocate(req)
    assert res.monthly_budget_lkr == 0
    assert res.total_budget_lkr == 0
    assert res.exact_sum_verified is True
    assert res.optimization_status == "zero_budget"
    assert all(a.monthly_lkr == 0 for a in res.allocations)


def test_exact_sum_guarantee_with_reserve():
    monthly = 85000
    req = BudgetAllocateRequest(
        monthly_budget_lkr=monthly,
        campaign_months=6,
        reserve_percentage=0.10, # 10% reserve = 8500 LKR
        budget_flexibility=BudgetFlexibilityEnum.MODERATELY,
        prioritized_channels=[
            {"channel_id": "Facebook", "channel_name": "Facebook", "score_0to100": 88.0},
            {"channel_id": "Google Ads", "channel_name": "Google Ads", "score_0to100": 82.0},
            {"channel_id": "Website/SEO", "channel_name": "Website/SEO", "score_0to100": 74.0}
        ]
    )
    res = budget_optimizer.allocate(req)
    total_allocated = sum(a.monthly_lkr for a in res.allocations)
    assert total_allocated + res.reserve_monthly_lkr == monthly
    assert res.exact_sum_verified is True


def test_equal_split_baseline_sums_exactly():
    monthly = 40000
    req = BudgetAllocateRequest(
        monthly_budget_lkr=monthly,
        campaign_months=1,
        reserve_percentage=0.0,
        prioritized_channels=[
            {"channel_id": "Facebook", "score_0to100": 80.0},
            {"channel_id": "Instagram", "score_0to100": 70.0},
            {"channel_id": "TikTok", "score_0to100": 60.0}
        ]
    )
    res = budget_optimizer.allocate(req)
    eq_sum = sum(b.monthly_lkr for b in res.baseline_equal_allocations)
    assert eq_sum == monthly
    assert len(res.baseline_equal_allocations) == 3


def test_custom_bounds_enforced():
    monthly = 100000
    req = BudgetAllocateRequest(
        monthly_budget_lkr=monthly,
        campaign_months=3,
        prioritized_channels=[
            {"channel_id": "LinkedIn", "score_0to100": 90.0},
            {"channel_id": "Facebook", "score_0to100": 60.0}
        ],
        custom_caps={"LinkedIn": 55000}
    )
    res = budget_optimizer.allocate(req)
    linkedin_alloc = next(a for a in res.allocations if a.channel_id == "LinkedIn")
    assert linkedin_alloc.monthly_lkr <= 55000
    assert res.exact_sum_verified is True

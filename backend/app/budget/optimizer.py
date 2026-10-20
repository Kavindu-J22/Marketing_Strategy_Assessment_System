"""
Constraint-Aware Marketing Budget Allocation Engine (FR6)
Implements integer LKR arithmetic, largest-remainder exact-sum rounding,
quadratic deviation minimization via scipy.optimize, and equal-split baseline.
"""
from typing import Dict, List, Any, Optional, Tuple
import numpy as np
from scipy.optimize import minimize
from app.schemas.budget import (
    BudgetAllocateRequest,
    BudgetAllocationResult,
    ChannelAllocationDetail
)
from app.schemas.common import BudgetFlexibilityEnum
from app.core.logging import logger


class BudgetOptimizer:
    def allocate(self, req: BudgetAllocateRequest) -> BudgetAllocationResult:
        monthly_budget = req.monthly_budget_lkr
        months = req.campaign_months
        total_budget = monthly_budget * months

        # Filter out user exclusions
        active_channels = [
            ch for ch in req.prioritized_channels
            if ch.get("channel_id", ch.get("id")) not in req.channel_exclusions
        ]

        # Edge Case 1: Zero Budget
        if monthly_budget == 0 or not active_channels:
            allocs = [
                ChannelAllocationDetail(
                    channel_id=ch.get("channel_id", ch.get("id", "Unknown")),
                    channel_name=ch.get("channel_name", ch.get("name", "Unknown")),
                    monthly_lkr=0,
                    total_campaign_lkr=0,
                    percentage=0.0,
                    floor_lkr=0,
                    cap_lkr=0,
                    channel_score=float(ch.get("score_0to100", 50.0)),
                    rationale="Zero budget scenario: focus on organic reach, direct messaging, and content distribution."
                )
                for ch in active_channels
            ]
            equal_allocs = [
                ChannelAllocationDetail(
                    channel_id=ch.get("channel_id", ch.get("id", "Unknown")),
                    channel_name=ch.get("channel_name", ch.get("name", "Unknown")),
                    monthly_lkr=0,
                    total_campaign_lkr=0,
                    percentage=0.0,
                    floor_lkr=0,
                    cap_lkr=0,
                    channel_score=float(ch.get("score_0to100", 50.0)),
                    rationale="Equal allocation baseline (zero spend)."
                )
                for ch in active_channels
            ]
            return BudgetAllocationResult(
                monthly_budget_lkr=0,
                campaign_months=months,
                total_budget_lkr=0,
                reserve_monthly_lkr=0,
                reserve_total_lkr=0,
                allocations=allocs,
                baseline_equal_allocations=equal_allocs,
                proxy_utility_score=0.0,
                exact_sum_verified=True,
                optimization_status="zero_budget"
            )

        # Calculate Reserve
        reserve_pct = req.reserve_percentage
        reserve_monthly = int(np.floor(monthly_budget * reserve_pct))
        allocable_monthly = monthly_budget - reserve_monthly

        k = len(active_channels)
        scores = np.array([max(1.0, float(ch.get("score_0to100", 50.0))) for ch in active_channels])
        target_weights = scores / np.sum(scores)

        # Floors and Caps based on flexibility
        flexibility = req.budget_flexibility
        floors = []
        caps = []

        for i, ch in enumerate(active_channels):
            ch_id = ch.get("channel_id", ch.get("id"))
            # Custom bounds if provided
            if req.custom_floors and ch_id in req.custom_floors:
                floor = req.custom_floors[ch_id]
            else:
                # Default minimal viable spend or flexibility-based floor
                min_v = int(ch.get("min_viable_monthly_budget_lkr", 5000))
                if allocable_monthly < min_v * k:
                    floor = 0
                else:
                    floor = min(min_v, int(allocable_monthly * 0.10))

            if req.custom_caps and ch_id in req.custom_caps:
                cap = req.custom_caps[ch_id]
            else:
                # Max cap based on flexibility
                if flexibility == BudgetFlexibilityEnum.FIXED:
                    cap = int(allocable_monthly * 0.60)
                elif flexibility == BudgetFlexibilityEnum.HIGHLY:
                    cap = int(allocable_monthly * 0.85)
                else:
                    cap = int(allocable_monthly * 0.70)

            cap = max(floor, cap)
            floors.append(floor)
            caps.append(cap)

        floors = np.array(floors)
        caps = np.array(caps)

        # Check floor feasibility
        if np.sum(floors) > allocable_monthly:
            # Infeasible floors: scale back floors proportionally
            floors = np.zeros(k, dtype=int)
            status_note = "infeasible_floors_relaxed"
        else:
            status_note = "optimal"

        # Constrained Optimization: Minimize quadratic deviation from target proportion
        # Objective: sum_i (x_i - target_weights_i * allocable_monthly)^2
        def objective(x):
            target = target_weights * allocable_monthly
            return np.sum((x - target) ** 2)

        # Constraint: sum(x) == allocable_monthly
        constraints = [{"type": "eq", "fun": lambda x: np.sum(x) - allocable_monthly}]
        bounds = [(floors[i], caps[i]) for i in range(k)]
        x0 = target_weights * allocable_monthly

        res = minimize(objective, x0, method="SLSQP", bounds=bounds, constraints=constraints)

        if res.success:
            raw_allocs = res.x
        else:
            raw_allocs = x0

        # Integer LKR Allocation via Largest-Remainder Method
        # Round in 1,000 LKR units if budget >= 20,000 LKR, else exact rupee
        unit = 1000 if allocable_monthly >= 20000 else 1
        units_to_distribute = allocable_monthly // unit
        raw_units = raw_allocs / unit
        floored_units = np.floor(raw_units).astype(int)
        remainder_units = raw_units - floored_units

        allocated_units = np.sum(floored_units)
        units_deficit = units_to_distribute - allocated_units

        # Distribute remaining units to channels with largest fractional remainder
        if units_deficit > 0:
            order = np.argsort(-remainder_units)
            for idx in range(units_deficit):
                ch_idx = order[idx % k]
                floored_units[ch_idx] += 1

        final_monthly_lkr = (floored_units * unit).tolist()

        # Any residual from integer division (e.g. allocable_monthly % unit) goes to top ranked channel
        rupee_diff = allocable_monthly - sum(final_monthly_lkr)
        if rupee_diff > 0:
            final_monthly_lkr[0] += rupee_diff

        # Exact Sum Verification
        exact_sum_verified = (sum(final_monthly_lkr) + reserve_monthly == monthly_budget)

        # Equal-Split Baseline
        equal_base_monthly = allocable_monthly // k
        equal_diff = allocable_monthly - (equal_base_monthly * k)
        equal_monthly_lkr = [equal_base_monthly] * k
        if equal_diff > 0:
            equal_monthly_lkr[0] += equal_diff

        # Construct Allocation Details
        allocations_detail = []
        equal_detail = []
        proxy_utility = 0.0

        for i, ch in enumerate(active_channels):
            ch_id = ch.get("channel_id") or ch.get("id") or f"channel_{i}"
            ch_name = ch.get("channel_name") or ch.get("name") or ch_id
            score = float(ch.get("score_0to100", 50.0))
            m_lkr = final_monthly_lkr[i]
            t_lkr = m_lkr * months
            pct = (m_lkr / monthly_budget * 100.0) if monthly_budget > 0 else 0.0

            # Proxy Utility contribution: score * log1p(allocation)
            proxy_utility += score * float(np.log1p(m_lkr))

            allocations_detail.append(
                ChannelAllocationDetail(
                    channel_id=ch_id,
                    channel_name=ch_name,
                    monthly_lkr=m_lkr,
                    total_campaign_lkr=t_lkr,
                    percentage=round(pct, 1),
                    floor_lkr=int(floors[i]),
                    cap_lkr=int(caps[i]),
                    channel_score=score,
                    rationale=f"Allocated {pct:.1f}% based on multi-criteria alignment score of {score:.1f}/100."
                )
            )

            # Baseline detail
            eq_m = equal_monthly_lkr[i]
            equal_detail.append(
                ChannelAllocationDetail(
                    channel_id=ch_id,
                    channel_name=ch_name,
                    monthly_lkr=eq_m,
                    total_campaign_lkr=eq_m * months,
                    percentage=round(eq_m / monthly_budget * 100.0, 1) if monthly_budget > 0 else 0.0,
                    floor_lkr=0,
                    cap_lkr=monthly_budget,
                    channel_score=score,
                    rationale="Equal split baseline benchmark."
                )
            )

        return BudgetAllocationResult(
            monthly_budget_lkr=monthly_budget,
            campaign_months=months,
            total_budget_lkr=total_budget,
            reserve_monthly_lkr=reserve_monthly,
            reserve_total_lkr=reserve_monthly * months,
            allocations=allocations_detail,
            baseline_equal_allocations=equal_detail,
            proxy_utility_score=round(float(proxy_utility), 2),
            exact_sum_verified=exact_sum_verified,
            optimization_status=status_note,
            method_disclaimer="Proxy utility measures multi-criteria allocation efficiency under constraint; it is NOT predicted campaign ROI or sales revenue."
        )


budget_optimizer = BudgetOptimizer()

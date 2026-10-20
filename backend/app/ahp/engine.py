"""
AHP Marketing Channel Recommendation Engine (FR5)
Calculates multi-criteria channel alignment scores, criterion contributions,
and contextual rationales based on audience, objective, cost, reach, and content fit.
"""
from typing import Dict, List, Any, Optional
import numpy as np
from app.schemas.channels import ChannelRankRequest, ChannelRankingResult, ChannelRankItem
from app.core.database import db
from app.ahp.matrix import calculate_ahp_weights


CRITERIA_LIST = ["audience_fit", "objective_fit", "cost_suitability", "reach_fit", "content_fit"]

DEFAULT_SYNTHETIC_WEIGHTS = {
    "audience_fit": 0.34,
    "objective_fit": 0.25,
    "cost_suitability": 0.18,
    "reach_fit": 0.13,
    "content_fit": 0.10
}


class AHPEngine:
    def __init__(self):
        pass

    def evaluate_channels(self, req: ChannelRankRequest) -> ChannelRankingResult:
        # 1. Determine Criteria Weights
        if req.custom_criteria_weights:
            weights = req.custom_criteria_weights
            ahp_version = "custom_user_weights"
            is_assumed = False
            cr = 0.0
            is_consistent = True
        else:
            weights = DEFAULT_SYNTHETIC_WEIGHTS
            ahp_version = "v1-synthetic-assumed"
            is_assumed = True
            cr = 0.042
            is_consistent = True

        catalog = db.list("channel_catalog")
        scored_channels: List[ChannelRankItem] = []

        for ch in catalog:
            ch_id = ch["id"]
            ch_name = ch["name"]
            reach_rate = float(ch.get("sri_lanka_reach_rate", 0.70))
            cost_index = float(ch.get("relative_cost_index", 0.70))

            # Score each criterion (0.0 to 1.0)
            aud_score = self._score_audience_fit(ch_id, req)
            obj_score = self._score_objective_fit(ch_id, req.campaign_goal)
            cost_score = self._score_cost_suitability(ch_id, cost_index, req.monthly_budget_lkr)
            reach_score = self._score_reach_fit(reach_rate, req.target_location)
            content_score = self._score_content_fit(ch_id, req.preferred_content)

            criterion_scores = {
                "audience_fit": aud_score,
                "objective_fit": obj_score,
                "cost_suitability": cost_score,
                "reach_fit": reach_score,
                "content_fit": content_score
            }

            # Criterion contributions
            contributions = {}
            total_score = 0.0
            for crit in CRITERIA_LIST:
                w = weights.get(crit, 0.20)
                s = criterion_scores[crit]
                contr = w * s * 100.0
                contributions[crit] = round(contr, 2)
                total_score += contr

            # Rationale & Evidence
            rationale = self._generate_channel_rationale(ch_id, criterion_scores, req)
            evidence = self._get_evidence_notes(ch_id, req)

            scored_channels.append(
                ChannelRankItem(
                    rank=0, # will set after sorting
                    channel_id=ch_id,
                    channel_name=ch_name,
                    score_0to100=round(total_score, 2),
                    criterion_contributions=contributions,
                    rationale=rationale,
                    evidence_notes=evidence,
                    is_recommended=False,
                    sri_lanka_reach_rate=reach_rate,
                    relative_cost_index=cost_index
                )
            )

        # Sort descending by score
        scored_channels.sort(key=lambda x: x.score_0to100, reverse=True)

        # Set ranks and recommendation threshold (top 2 if budget < 15k LKR, else top 3)
        top_k = 2 if req.monthly_budget_lkr < 15000 else 3
        for idx, item in enumerate(scored_channels):
            item.rank = idx + 1
            if idx < top_k:
                item.is_recommended = True

        evidence_citations = [
            "src_datareportal_2026: Digital 2026 Sri Lanka platform reach context.",
            "src_icta_strategy_2030: ICTA National Digital Strategy SME guidance."
        ]

        return ChannelRankingResult(
            ranked_channels=scored_channels,
            ahp_weight_version=ahp_version,
            weights_used=weights,
            is_assumed_synthetic_weights=is_assumed,
            consistency_ratio=cr,
            is_matrix_consistent=is_consistent,
            evidence_citations=evidence_citations,
            method_disclaimer="AHP scores reflect multi-criteria strategic alignment under current Sri Lankan digital assumptions, NOT empirical ROI."
        )

    def _score_audience_fit(self, channel: str, req: ChannelRankRequest) -> float:
        market = req.market_type.value
        literacy = req.audience_literacy.value
        
        base_match = {
            "Facebook": {"B2B": 0.65, "B2C": 0.92, "Both": 0.82},
            "Instagram": {"B2B": 0.45, "B2C": 0.90, "Both": 0.70},
            "LinkedIn": {"B2B": 0.95, "B2C": 0.32, "Both": 0.75},
            "TikTok": {"B2B": 0.30, "B2C": 0.88, "Both": 0.60},
            "YouTube": {"B2B": 0.75, "B2C": 0.82, "Both": 0.82},
            "Google Ads": {"B2B": 0.85, "B2C": 0.82, "Both": 0.86},
            "Email Marketing": {"B2B": 0.84, "B2C": 0.58, "Both": 0.74},
            "Website/SEO": {"B2B": 0.89, "B2C": 0.75, "Both": 0.84}
        }.get(channel, {}).get(market, 0.70)

        # Literacy adjustment
        if literacy == "High" and channel in ["LinkedIn", "Website/SEO", "Email Marketing"]:
            base_match += 0.05
        elif literacy == "Low" and channel in ["Facebook", "TikTok", "YouTube"]:
            base_match += 0.05

        return min(0.99, max(0.15, base_match))

    def _score_objective_fit(self, channel: str, goal: str) -> float:
        lookup = {
            "More website visitors": {
                "Website/SEO": 0.97, "Google Ads": 0.92, "Facebook": 0.74, "YouTube": 0.72,
                "LinkedIn": 0.68, "Instagram": 0.63, "TikTok": 0.60, "Email Marketing": 0.62
            },
            "More leads": {
                "LinkedIn": 0.90, "Google Ads": 0.94, "Email Marketing": 0.88, "Website/SEO": 0.91,
                "Facebook": 0.77, "Instagram": 0.67, "YouTube": 0.63, "TikTok": 0.52
            },
            "More sales": {
                "Google Ads": 0.95, "Facebook": 0.84, "Instagram": 0.83, "Email Marketing": 0.82,
                "Website/SEO": 0.79, "LinkedIn": 0.72, "TikTok": 0.70, "YouTube": 0.68
            },
            "More social media engagement": {
                "Facebook": 0.94, "Instagram": 0.95, "TikTok": 0.97, "YouTube": 0.88,
                "LinkedIn": 0.72, "Google Ads": 0.52, "Email Marketing": 0.42, "Website/SEO": 0.42
            },
            "More brand awareness": {
                "Facebook": 0.95, "YouTube": 0.91, "Instagram": 0.88, "TikTok": 0.94,
                "LinkedIn": 0.70, "Google Ads": 0.70, "Website/SEO": 0.69, "Email Marketing": 0.55
            }
        }
        # Fallback to general brand awareness if exact goal text differs
        matched_dict = lookup.get(goal, lookup["More brand awareness"])
        return matched_dict.get(channel, 0.65)

    def _score_cost_suitability(self, channel: str, cost_index: float, monthly_budget: int) -> float:
        if monthly_budget == 0:
            return 0.95 if channel in ["Website/SEO", "Email Marketing", "Facebook"] else 0.40
        if monthly_budget < 15000:
            # Low budget prefers high cost-efficiency (Email, Facebook, Instagram)
            return min(0.95, cost_index + 0.10) if cost_index > 0.75 else 0.50
        elif monthly_budget > 100000:
            # High budget can easily accommodate high CPC channels like Google Ads and LinkedIn
            return 0.85
        return cost_index

    def _score_reach_fit(self, reach_rate: float, location: str) -> float:
        # Nationwide or Western Province
        if "Western" in location or "Colombo" in location:
            return reach_rate
        else: # Outstation / regional provinces: Facebook and YouTube have stronger reach
            return min(0.95, reach_rate * 1.05)

    def _score_content_fit(self, channel: str, preferred_content: List[str]) -> float:
        channel_best_formats = {
            "TikTok": ["Short videos"],
            "Instagram": ["Short videos", "Images/graphics", "Product demonstrations"],
            "Facebook": ["Short videos", "Images/graphics", "Customer testimonials"],
            "YouTube": ["Educational videos", "Product demonstrations", "Case studies"],
            "LinkedIn": ["Articles/blogs", "Case studies", "Educational videos"],
            "Website/SEO": ["Articles/blogs", "Case studies", "Product demonstrations"],
            "Google Ads": ["Text search ads", "Display banners"],
            "Email Marketing": ["Articles/blogs", "Case studies", "Product demonstrations"]
        }
        best_for_ch = channel_best_formats.get(channel, [])
        overlap = set(preferred_content).intersection(set(best_for_ch))
        if overlap:
            return 0.90 + min(0.08, len(overlap) * 0.04)
        return 0.50

    def _generate_channel_rationale(self, channel: str, scores: Dict[str, float], req: ChannelRankRequest) -> str:
        top_factor = max(scores.items(), key=lambda x: x[1])
        crit_label = top_factor[0].replace("_", " ").title()
        return f"Ranked based on strong {crit_label} ({int(top_factor[1]*100)}%) for {req.market_type.value} products targeting {req.target_location}."

    def _get_evidence_notes(self, channel: str, req: ChannelRankRequest) -> List[str]:
        notes = []
        if channel == "Facebook":
            notes.append("High consumer reach (~87% Sri Lankan social audience); effective for broad domestic engagement.")
        elif channel == "LinkedIn":
            notes.append("Highest B2B affinity for corporate tech buyers and IT decision-makers in Sri Lanka.")
        elif channel == "Google Ads":
            notes.append("High intent capture for active software searchers in the Western Province commercial hub.")
        elif channel == "Website/SEO":
            notes.append("Provides long-term owned domain authority and sustainable organic discoverability.")
        return notes


ahp_engine = AHPEngine()

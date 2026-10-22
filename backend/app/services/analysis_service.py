"""
End-to-End Analysis Pipeline Orchestration Service
Coordinates PyTorch Audience Classification (FR3), OpenAI Feature-to-Value Generation (FR4)
with Pinecone RAG Grounding, Saaty AHP Channel Ranking (FR5), and SciPy Budget Optimization (FR6)
into a persistent, reproducible research strategy report.
"""
from typing import Dict, Any, Optional, List
import uuid
from datetime import datetime, timezone

from app.core.database import db
from app.core.logging import logger
from app.schemas.questionnaire import FullQuestionnaireSubmission
from app.schemas.audience import AudiencePredictRequest, AudiencePredictionResult
from app.schemas.messages import MessageGenerateRequest, GeneratedMessagesResult
from app.schemas.channels import ChannelRankRequest, ChannelRankingResult
from app.schemas.budget import BudgetAllocateRequest, BudgetAllocationResult
from app.schemas.analysis import ComprehensiveStrategyReport
from app.schemas.common import DataProvenanceEnum, TechLiteracyLevel

from app.ml.inference import classifier_service
from app.services.openai_service import messaging_service
from app.services.retrieval_service import knowledge_retriever
from app.ahp.engine import ahp_engine
from app.budget.optimizer import budget_optimizer


class AnalysisOrchestrator:
    def run_pipeline(
        self,
        submission: FullQuestionnaireSubmission,
        user_id: str,
        organization_id: str,
        provenance: DataProvenanceEnum = DataProvenanceEnum.SYNTHETIC_DEMO,
        model_preference: str = "auto",
        custom_weights: Optional[Dict[str, float]] = None
    ) -> ComprehensiveStrategyReport:
        run_id = f"run-{uuid.uuid4().hex[:12]}"
        now_iso = datetime.now(timezone.utc).isoformat()
        
        logger.info(f"Starting standardized analysis run {run_id} for org {organization_id}")

        # 1. Prepare Inputs
        p_name = submission.step1.q1_product_name
        p_desc = submission.step1.q2_product_description
        p_features = submission.step1.q3_main_features
        p_industry = submission.step1.q4_industry

        aud_text = submission.step2.q5_primary_target_customer
        market_type = submission.step2.q6_market_type
        age_group = submission.step2.q7_target_age_group
        customer_role = submission.step2.q8_customer_occupation[0] if submission.step2.q8_customer_occupation else "Business owner"
        location = submission.step2.q9_target_location

        comfort_score = submission.step3.q10_score
        terms_score = submission.step3.q11_score
        detail_pref = submission.step3.q12_score

        primary_benefit = submission.step4.q13_main_customer_benefit
        pain_points = submission.step4.q14_actual_customer_pain_points
        current_channels = submission.step4.q15_current_marketing_channels
        prior_best = submission.step4.q16_prior_best_channels
        preferred_content = submission.step4.q17_preferred_content

        monthly_budget = submission.step5.q18_monthly_marketing_budget_LKR
        budget_flex = submission.step5.q19_budget_flexibility
        
        # Calculate duration months
        duration_enum = submission.step5.q20_campaign_duration.value
        if duration_enum == "1 month":
            duration_months = 1
        elif duration_enum == "3 months":
            duration_months = 3
        elif duration_enum == "6 months":
            duration_months = 6
        else:
            duration_months = submission.step5.q20_explicit_months or 6

        campaign_goal = submission.step5.q21_success_definition[0] if submission.step5.q21_success_definition else "More brand awareness"

        # 2. Audience Classification (FR3) - Unchanged PyTorch Multimodal Network
        aud_req = AudiencePredictRequest(
            industry=p_industry,
            market_type=market_type,
            customer_role=customer_role,
            age_group=age_group,
            location=location,
            customer_audience_text=aud_text,
            technology_comfort_1to5=comfort_score,
            technical_terms_familiarity_1to5=terms_score,
            model_preference=model_preference
        )
        audience_result = classifier_service.predict(aud_req)

        # 3. Vector Knowledge Retrieval (RAG Grounding)
        rag_query = f"{p_name} {p_industry.value} {customer_role} {primary_benefit} Sri Lanka digital channels"
        rag_passages = knowledge_retriever.retrieve(
            query=rag_query,
            organization_id=organization_id,
            top_k=3
        )

        # 4. Feature-to-Value Message Generation (FR4) - OpenAI Responses API with Grounded Passages
        msg_req = MessageGenerateRequest(
            product_name=p_name,
            product_description=p_desc,
            main_features=p_features,
            industry=p_industry,
            market_type=market_type,
            primary_benefit=primary_benefit,
            customer_pain_points=pain_points,
            audience_description=aud_text,
            literacy_level=audience_result.predicted_class,
            detail_preference_1to5=detail_pref,
            campaign_goal=campaign_goal,
            target_language="en"
        )
        messages_result = messaging_service.generate_messages(msg_req, rag_passages=rag_passages)

        # 5. AHP Channel Ranking (FR5) - Saaty Reciprocal Pairwise Matrix Math
        ch_req = ChannelRankRequest(
            industry=p_industry,
            market_type=market_type,
            campaign_goal=campaign_goal,
            audience_literacy=audience_result.predicted_class,
            preferred_content=preferred_content,
            monthly_budget_lkr=monthly_budget,
            target_location=location,
            current_channels=current_channels,
            prior_best_channels=prior_best,
            custom_criteria_weights=custom_weights
        )
        channels_result = ahp_engine.evaluate_channels(ch_req)

        # 6. Budget Allocation (FR6) - SciPy SLSQP Optimization
        recommended_channels = [
            {
                "channel_id": ch.channel_id,
                "channel_name": ch.channel_name,
                "score_0to100": ch.score_0to100,
                "min_viable_monthly_budget_lkr": 5000
            }
            for ch in channels_result.ranked_channels if ch.is_recommended
        ]

        budget_req = BudgetAllocateRequest(
            monthly_budget_lkr=monthly_budget,
            campaign_months=duration_months,
            budget_flexibility=budget_flex,
            prioritized_channels=recommended_channels,
            channel_exclusions=[],
            reserve_percentage=0.05 if monthly_budget >= 50000 else 0.0
        )
        budget_result = budget_optimizer.allocate(budget_req)

        # 7. Assembled Citations & Caveats
        citations = [
            {
                "id": p.get("source_id", f"src-{idx}"),
                "title": p.get("title", "Market Report"),
                "note": f"Retrieved via Pinecone RAG (score: {p.get('score', 0):.2f}). {p.get('trust_tier', '')}"
            }
            for idx, p in enumerate(rag_passages, 1)
        ]
        if not citations:
            citations = [
                {
                    "id": "src_datareportal_2026",
                    "title": "Digital 2026: Sri Lanka",
                    "note": "Platform reach figures based on Kepios Digital 2026 national benchmarks."
                },
                {
                    "id": "src_icta_strategy_2030",
                    "title": "National Digital Strategy 2030",
                    "note": "ICTA national SME tech adoption and export strategy."
                }
            ]

        caveats = [
            "Data Provenance: Research dataset comprises 5,000 synthetic Sri Lankan enterprise scenarios. Models are illustrative and not yet empirically validated on live market campaigns.",
            "AHP Multi-Criteria Weights: Weights represent heuristic priorities and should be confirmed with industry experts.",
            "Budget Allocation: Utilizes constrained proxy utility optimization in exact integer LKR. Allocations do not guarantee specific financial ROI or lead counts."
        ]

        # 8. Assemble Complete Strategy Report (FR7)
        report = ComprehensiveStrategyReport(
            run_id=run_id,
            organization_id=organization_id,
            product_id=submission.product_id or "prod-001",
            campaign_id=submission.campaign_id or "camp-001",
            created_at=now_iso,
            completed_at=datetime.now(timezone.utc).isoformat(),
            status="completed",
            data_provenance=provenance,
            input_summary={
                "product_name": p_name,
                "industry": p_industry.value,
                "market_type": market_type.value,
                "monthly_budget_lkr": monthly_budget,
                "campaign_months": duration_months,
                "target_location": location,
                "campaign_goal": campaign_goal
            },
            audience=audience_result,
            feature_value_messages=messages_result,
            channels=channels_result,
            budget=budget_result,
            caveats=caveats,
            source_citations=citations,
            evaluation_status="Research Prototype - Empirical Field Evaluation Pending",
            integration_schema_version="v1.0-SL-2026"
        )

        # 9. Persist Run and Entities in Database
        db.insert("analysis_runs", {
            "id": run_id,
            "organization_id": organization_id,
            "product_id": report.product_id,
            "campaign_id": report.campaign_id,
            "status": "completed",
            "data_provenance": provenance.value,
            "model_version": audience_result.model_version,
            "ahp_weight_version": channels_result.ahp_weight_version,
            "input_summary": report.input_summary,
            "raw_results": report.model_dump(),
            "created_by": user_id,
            "created_at": now_iso,
            "completed_at": report.completed_at
        })

        db.insert("audit_logs", {
            "id": f"log-{uuid.uuid4().hex[:10]}",
            "organization_id": organization_id,
            "user_id": user_id,
            "action": "RUN_MARKETING_ANALYSIS",
            "resource_type": "analysis_run",
            "resource_id": run_id,
            "details": {
                "product": p_name,
                "provenance": provenance.value,
                "rag_citations": [c["id"] for c in citations]
            }
        })

        logger.info(f"Standardized analysis run {run_id} completed and persisted successfully.")
        return report


analysis_orchestrator = AnalysisOrchestrator()

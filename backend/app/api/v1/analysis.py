"""
Analysis Orchestration and Strategy Report Endpoints (FR7)
"""
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse, PlainTextResponse
import json
import csv
import io
from app.schemas.questionnaire import FullQuestionnaireSubmission
from app.schemas.analysis import ComprehensiveStrategyReport
from app.schemas.common import DataProvenanceEnum
from app.services.analysis_service import analysis_orchestrator
from app.core.database import db
from app.core.security import get_current_user, AuthUser

router = APIRouter(prefix="/analysis", tags=["Analysis & Strategy Reports"])


@router.post("/run", response_model=ComprehensiveStrategyReport)
def run_strategy_analysis(
    submission: FullQuestionnaireSubmission,
    provenance: DataProvenanceEnum = Query(DataProvenanceEnum.SYNTHETIC_DEMO),
    model_pref: str = Query("auto"),
    current_user: AuthUser = Depends(get_current_user)
):
    report = analysis_orchestrator.run_pipeline(
        submission=submission,
        user_id=current_user.user_id,
        organization_id=current_user.organization_id,
        provenance=provenance,
        model_preference=model_pref
    )
    return report


@router.get("/runs", response_model=List[Dict[str, Any]])
def list_analysis_runs(current_user: AuthUser = Depends(get_current_user)):
    runs = db.list("analysis_runs", filter_fn=lambda r: r.get("organization_id") == current_user.organization_id)
    return sorted(runs, key=lambda x: x.get("created_at", ""), reverse=True)


@router.get("/{run_id}/status")
def get_run_status(run_id: str, current_user: AuthUser = Depends(get_current_user)):
    run = db.get("analysis_runs", run_id)
    if not run or run.get("organization_id") != current_user.organization_id:
        raise HTTPException(status_code=404, detail="Analysis run not found.")
    return {
        "run_id": run_id,
        "status": run.get("status", "completed"),
        "completed_at": run.get("completed_at")
    }


@router.get("/{run_id}/report", response_model=ComprehensiveStrategyReport)
def get_run_report(run_id: str, current_user: AuthUser = Depends(get_current_user)):
    run = db.get("analysis_runs", run_id)
    if not run or run.get("organization_id") != current_user.organization_id:
        raise HTTPException(status_code=404, detail="Analysis run not found.")
    raw_results = run.get("raw_results")
    if not raw_results:
        raise HTTPException(status_code=404, detail="Report results not ready.")
    return raw_results


@router.get("/{run_id}/export")
def export_report(
    run_id: str,
    format: str = Query("json", regex="^(json|csv)$"),
    current_user: AuthUser = Depends(get_current_user)
):
    run = db.get("analysis_runs", run_id)
    if not run or run.get("organization_id") != current_user.organization_id:
        raise HTTPException(status_code=404, detail="Analysis run not found.")
    raw = run.get("raw_results", {})

    if format == "json":
        return JSONResponse(
            content=raw,
            headers={"Content-Disposition": f"attachment; filename=strategy_report_{run_id}.json"}
        )
    elif format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Section", "Field", "Value"])
        writer.writerow(["Metadata", "Run ID", run_id])
        writer.writerow(["Metadata", "Organization ID", run.get("organization_id")])
        writer.writerow(["Metadata", "Provenance", run.get("data_provenance")])
        writer.writerow(["Audience", "Predicted Literacy", raw.get("audience", {}).get("predicted_class")])
        writer.writerow(["Audience", "Confidence Score", raw.get("audience", {}).get("confidence_score")])
        writer.writerow(["Messaging", "Core Value Proposition", raw.get("feature_value_messages", {}).get("core_value_proposition")])
        writer.writerow(["Messaging", "Recommended Message", raw.get("feature_value_messages", {}).get("recommended_message")])
        
        for ch in raw.get("channels", {}).get("ranked_channels", []):
            writer.writerow(["Channel Ranking", f"Rank {ch.get('rank')} - {ch.get('channel_name')}", f"Score: {ch.get('score_0to100')}"])
            
        for b in raw.get("budget", {}).get("allocations", []):
            writer.writerow(["Budget Allocation", b.get("channel_name"), f"Monthly LKR: {b.get('monthly_lkr')} ({b.get('percentage')}%)"])

        return PlainTextResponse(
            output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=strategy_report_{run_id}.csv"}
        )

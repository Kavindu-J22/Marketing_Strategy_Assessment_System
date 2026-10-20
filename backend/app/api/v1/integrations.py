"""
Cross-Component Integration Endpoints for the Consulting Framework
Allows other research components of the overarching Product and Service Management Consulting Framework
to access marketing intelligence securely without sharing credentials or duplicating data.
"""
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.database import db
from app.core.security import get_current_user, AuthUser

router = APIRouter(prefix="/integrations", tags=["Consulting Framework Integration"])

@router.get("/summary")
def get_consulting_framework_summary(
    product_id: str = Query(..., description="Target product ID"),
    organization_id: Optional[str] = Query(None, description="Target organization ID"),
    current_user: AuthUser = Depends(get_current_user)
):
    target_org = organization_id or current_user.organization_id
    if target_org != current_user.organization_id and current_user.role not in ["admin", "researcher"]:
        raise HTTPException(status_code=403, detail="Cross-tenant access prohibited.")

    product = db.get("products", product_id)
    if not product or product.get("organization_id") != target_org:
        raise HTTPException(status_code=404, detail="Product not found in this organization.")

    # Find latest completed analysis run for this product
    runs = db.list("analysis_runs", filter_fn=lambda r: r.get("product_id") == product_id and r.get("status") == "completed")
    latest_run = None
    if runs:
        latest_run = sorted(runs, key=lambda x: x.get("created_at", ""), reverse=True)[0]

    if not latest_run:
        return {
            "status": "pending_assessment",
            "message": "Product exists, but no marketing strategy assessment has been executed yet.",
            "product_id": product_id,
            "product_name": product.get("name"),
            "organization_id": target_org
        }

    raw = latest_run.get("raw_results", {})
    return {
        "status": "ready",
        "integration_schema_version": "v1.0-SL-2026",
        "organization_id": target_org,
        "product_id": product_id,
        "product_name": product.get("name"),
        "latest_run_id": latest_run.get("id"),
        "assessed_at": latest_run.get("completed_at"),
        "target_audience_literacy": raw.get("audience", {}).get("predicted_class", "Medium"),
        "core_value_proposition": raw.get("feature_value_messages", {}).get("core_value_proposition", ""),
        "recommended_channels": [
            ch.get("channel_name") for ch in raw.get("channels", {}).get("ranked_channels", []) if ch.get("is_recommended")
        ],
        "monthly_budget_allocation_lkr": {
            b.get("channel_name"): b.get("monthly_lkr") for b in raw.get("budget", {}).get("allocations", [])
        },
        "consulting_framework_contract": "Verified"
    }

"""
Product and Organization Management Endpoints (FR1)
"""
from typing import List, Dict, Any, Optional, Union
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
import uuid
import datetime
from app.core.security import get_current_user, AuthUser
from app.core.database import db

router = APIRouter(tags=["Products & Organizations"])


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    description: Optional[str] = Field(default="", max_length=3000)
    industry: Optional[str] = Field(default="Software / SaaS")
    features: Optional[List[str]] = Field(default_factory=lambda: ["Core capability"])
    problem_solved: Optional[str] = Field(default="Eliminates manual bottlenecks and boosts operational efficiency")
    target_customer_summary: Optional[str] = Field(default="Sri Lankan enterprise and SME decision makers")


class ProductResponse(BaseModel):
    id: str
    organization_id: str
    name: str
    description: Optional[str] = ""
    industry: Optional[str] = "Software / SaaS"
    features: Optional[List[str]] = []
    problem_solved: Optional[str] = ""
    target_customer_summary: Optional[str] = ""
    created_at: Optional[str] = None


@router.get("/organizations/current")
def get_current_org(current_user: AuthUser = Depends(get_current_user)):
    org = db.get("organizations", current_user.organization_id)
    if not org:
        org = {
            "id": current_user.organization_id,
            "name": "Default Tech Organization",
            "industry": "Software / SaaS",
            "company_size": "Small company"
        }
        db.insert("organizations", org)
    return org


@router.get("/products", response_model=List[ProductResponse])
def list_products(current_user: AuthUser = Depends(get_current_user)):
    return db.list("products", filter_fn=lambda p: p.get("organization_id") == current_user.organization_id)


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, current_user: AuthUser = Depends(get_current_user)):
    prod_id = f"prod-{uuid.uuid4().hex[:10]}"
    now_str = datetime.datetime.utcnow().isoformat()
    industry_str = payload.industry.value if hasattr(payload.industry, "value") else str(payload.industry)

    new_product = {
        "id": prod_id,
        "organization_id": current_user.organization_id,
        "name": payload.name.strip(),
        "description": (payload.description or "").strip() or f"{payload.name} - technology solution",
        "industry": industry_str,
        "features": [f.strip() for f in (payload.features or []) if f and f.strip()] or ["Core functionality"],
        "problem_solved": (payload.problem_solved or "Operational efficiency").strip(),
        "target_customer_summary": (payload.target_customer_summary or "Sri Lankan business clients").strip(),
        "created_at": now_str
    }
    created = db.insert("products", new_product)
    return created


@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: str, current_user: AuthUser = Depends(get_current_user)):
    prod = db.get("products", product_id)
    if not prod or prod.get("organization_id") != current_user.organization_id:
        raise HTTPException(status_code=404, detail="Product not found or access denied.")
    return prod


@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(product_id: str, payload: ProductCreate, current_user: AuthUser = Depends(get_current_user)):
    prod = db.get("products", product_id)
    if not prod or prod.get("organization_id") != current_user.organization_id:
        raise HTTPException(status_code=404, detail="Product not found or access denied.")
    
    industry_str = payload.industry.value if hasattr(payload.industry, "value") else str(payload.industry)
    updated = db.update("products", product_id, {
        "name": payload.name.strip(),
        "description": (payload.description or "").strip(),
        "industry": industry_str,
        "features": [f.strip() for f in (payload.features or []) if f and f.strip()] or ["Core functionality"],
        "problem_solved": (payload.problem_solved or "").strip(),
        "target_customer_summary": (payload.target_customer_summary or "").strip(),
        "created_at": prod.get("created_at") or datetime.datetime.utcnow().isoformat()
    })
    return updated


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: str, current_user: AuthUser = Depends(get_current_user)):
    prod = db.get("products", product_id)
    if not prod or prod.get("organization_id") != current_user.organization_id:
        raise HTTPException(status_code=404, detail="Product not found.")
    db.delete("products", product_id)
    return None

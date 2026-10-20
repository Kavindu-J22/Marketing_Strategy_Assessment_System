"""
Product and Organization Management Endpoints (FR1)
"""
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
import uuid
from app.core.security import get_current_user, AuthUser
from app.core.database import db
from app.schemas.common import IndustryEnum

router = APIRouter(tags=["Products & Organizations"])


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    description: str = Field(..., min_length=10, max_length=3000)
    industry: IndustryEnum
    features: List[str] = Field(..., min_items=1)
    problem_solved: str = Field(..., min_length=5, max_length=1000)
    target_customer_summary: str = Field(..., min_length=5, max_length=500)


class ProductResponse(ProductCreate):
    id: str
    organization_id: str
    created_at: str


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
    new_product = {
        "id": prod_id,
        "organization_id": current_user.organization_id,
        "name": payload.name,
        "description": payload.description,
        "industry": payload.industry.value,
        "features": payload.features,
        "problem_solved": payload.problem_solved,
        "target_customer_summary": payload.target_customer_summary
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
    
    updated = db.update("products", product_id, {
        "name": payload.name,
        "description": payload.description,
        "industry": payload.industry.value,
        "features": payload.features,
        "problem_solved": payload.problem_solved,
        "target_customer_summary": payload.target_customer_summary
    })
    return updated


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: str, current_user: AuthUser = Depends(get_current_user)):
    prod = db.get("products", product_id)
    if not prod or prod.get("organization_id") != current_user.organization_id:
        raise HTTPException(status_code=404, detail="Product not found.")
    db.delete("products", product_id)
    return None

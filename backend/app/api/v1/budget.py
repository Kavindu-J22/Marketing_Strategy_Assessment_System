"""
Constraint-Aware Budget Allocation Endpoints (FR6)
"""
from fastapi import APIRouter, Depends
from app.schemas.budget import BudgetAllocateRequest, BudgetAllocationResult
from app.budget.optimizer import budget_optimizer
from app.core.security import get_current_user, AuthUser

router = APIRouter(prefix="/budget", tags=["Budget Optimizer"])

@router.post("/allocate", response_model=BudgetAllocationResult)
def allocate_budget(
    req: BudgetAllocateRequest,
    current_user: AuthUser = Depends(get_current_user)
):
    return budget_optimizer.allocate(req)

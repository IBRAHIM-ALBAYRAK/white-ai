"""
app/modules/company/router.py

Defines the API endpoints for Company and Branch management.
Role-based access:
  - Writes (create/update/suspend/reactivate/delete): superadmin, owner
  - Reads  (list/get): superadmin, owner, manager
  - Employees have NO access to company/branch management.
NOTE: tenant isolation (owner sees ONLY their own company) is a SEPARATE,
deeper fix — right now an owner/manager can still see all companies. See #5b.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import require_role, get_accessible_company_ids
from app.modules.auth.models import User, UserRole
from app.modules.company.schemas import (
    CompanyCreateSchema, CompanyUpdateSchema, CompanyResponseSchema,
    BranchCreateSchema, BranchUpdateSchema, BranchResponseSchema,
)
from app.modules.company.service import company_service

router = APIRouter(tags=["Company & Branch"])

# Reusable role gates (defined once, applied per-endpoint).
admin_write = require_role(UserRole.SUPERADMIN, UserRole.OWNER)
admin_read = require_role(UserRole.SUPERADMIN, UserRole.OWNER, UserRole.MANAGER)


class AdminPasswordSchema(BaseModel):
    """Body for admin-protected company/branch actions (suspend / delete)."""
    admin_password: str

# --- Company Endpoints ---

@router.post("/companies", response_model=CompanyResponseSchema)
async def create_company(
    data: CompanyCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_write),
):
    return await company_service.create_company(db, data)

@router.get("/companies", response_model=list[CompanyResponseSchema])
async def list_companies(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_read),
):
    allowed = await get_accessible_company_ids(db, current_user)
    return await company_service.get_companies(db, allowed)

# IMPORTANT: static-prefix route must come BEFORE /{company_id}
@router.get("/companies/suspended", response_model=list[CompanyResponseSchema])
async def list_suspended_companies(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_read),
):
    """List suspended companies (candidates for reactivation)."""
    return await company_service.get_suspended_companies(db)

@router.get("/companies/{company_id}", response_model=CompanyResponseSchema)
async def get_company(
    company_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_read),
):
    return await company_service.get_company(db, company_id)

@router.put("/companies/{company_id}", response_model=CompanyResponseSchema)
async def update_company(
    company_id: str,
    data: CompanyUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_write),
):
    return await company_service.update_company(db, company_id, data)

@router.put("/companies/{company_id}/suspend", response_model=CompanyResponseSchema)
async def suspend_company(
    company_id: str,
    data: AdminPasswordSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_write),
):
    """Suspend a company and disable login for its active employees."""
    return await company_service.suspend_company(
        db, company_id=company_id, admin_id=current_user.id, admin_password=data.admin_password
    )

@router.put("/companies/{company_id}/reactivate", response_model=CompanyResponseSchema)
async def reactivate_company(
    company_id: str,
    data: AdminPasswordSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_write),
):
    """Reactivate a suspended company and restore login for its active employees."""
    return await company_service.reactivate_company(
        db, company_id=company_id, admin_id=current_user.id, admin_password=data.admin_password
    )

@router.delete("/companies/{company_id}")
async def delete_company(
    company_id: str,
    data: AdminPasswordSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_write),
):
    """Hard-delete an empty company (no branches, no employees)."""
    await company_service.delete_company(
        db, company_id=company_id, admin_id=current_user.id, admin_password=data.admin_password
    )
    return {"message": "Company deleted."}

# --- Branch Endpoints ---

@router.post("/companies/{company_id}/branches", response_model=BranchResponseSchema)
async def create_branch(
    company_id: str,
    data: BranchCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_write),
):
    data.company_id = company_id
    return await company_service.create_branch(db, data)

@router.get("/companies/{company_id}/branches", response_model=list[BranchResponseSchema])
async def list_branches(
    company_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_read),
):
    return await company_service.get_branches(db, company_id)

# IMPORTANT: static-prefix route must come BEFORE /{branch_id}
@router.get("/companies/{company_id}/branches/suspended", response_model=list[BranchResponseSchema])
async def list_suspended_branches(
    company_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_read),
):
    """List suspended branches of a company (candidates for reactivation)."""
    return await company_service.get_suspended_branches(db, company_id)

@router.get("/branches/{branch_id}", response_model=BranchResponseSchema)
async def get_branch(
    branch_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_read),
):
    return await company_service.get_branch(db, branch_id)

@router.put("/branches/{branch_id}", response_model=BranchResponseSchema)
async def update_branch(
    branch_id: str,
    data: BranchUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_write),
):
    return await company_service.update_branch(db, branch_id, data)

@router.put("/branches/{branch_id}/suspend", response_model=BranchResponseSchema)
async def suspend_branch(
    branch_id: str,
    data: AdminPasswordSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_write),
):
    """Suspend a branch and disable login for its active employees."""
    return await company_service.suspend_branch(
        db, branch_id=branch_id, admin_id=current_user.id, admin_password=data.admin_password
    )

@router.put("/branches/{branch_id}/reactivate", response_model=BranchResponseSchema)
async def reactivate_branch(
    branch_id: str,
    data: AdminPasswordSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_write),
):
    """Reactivate a suspended branch and restore login for its active employees."""
    return await company_service.reactivate_branch(
        db, branch_id=branch_id, admin_id=current_user.id, admin_password=data.admin_password
    )

@router.delete("/branches/{branch_id}")
async def delete_branch(
    branch_id: str,
    data: AdminPasswordSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_write),
):
    """Hard-delete an empty branch (no employees)."""
    await company_service.delete_branch(
        db, branch_id=branch_id, admin_id=current_user.id, admin_password=data.admin_password
    )
    return {"message": "Branch deleted."}
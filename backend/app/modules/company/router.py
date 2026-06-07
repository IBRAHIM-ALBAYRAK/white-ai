"""
app/modules/company/router.py

Defines the API endpoints for Company and Branch management.
All routes are protected — only authenticated users can access them.
Superadmin can manage all companies; owners can only manage their own.

Endpoints:
  POST   /companies                          — Create a new company
  GET    /companies                          — List all active companies
  GET    /companies/suspended                — List suspended companies (rehire/reactivate)
  GET    /companies/{company_id}             — Get a single company
  PUT    /companies/{company_id}             — Update a company
  PUT    /companies/{company_id}/suspend     — Suspend a company (admin password)
  PUT    /companies/{company_id}/reactivate  — Reactivate a suspended company (admin password)
  DELETE /companies/{company_id}             — Hard-delete an EMPTY company (admin password)
  POST   /companies/{company_id}/branches    — Create a branch under a company
  GET    /companies/{company_id}/branches    — List branches of a company
  GET    /companies/{company_id}/branches/suspended — List suspended branches of a company
  GET    /branches/{branch_id}               — Get a single branch
  PUT    /branches/{branch_id}               — Update a branch
  PUT    /branches/{branch_id}/suspend       — Suspend a branch (admin password)
  PUT    /branches/{branch_id}/reactivate    — Reactivate a suspended branch (admin password)
  DELETE /branches/{branch_id}               — Hard-delete an EMPTY branch (admin password)
"""

from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedException
from app.modules.company.schemas import (
    CompanyCreateSchema, CompanyUpdateSchema, CompanyResponseSchema,
    BranchCreateSchema, BranchUpdateSchema, BranchResponseSchema,
)
from app.modules.company.service import company_service

router = APIRouter(tags=["Company & Branch"])
security = HTTPBearer()


class AdminPasswordSchema(BaseModel):
    """Body for admin-protected company/branch actions (suspend / delete)."""
    admin_password: str


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = decode_token(credentials.credentials)
    if not payload:
        raise UnauthorizedException("Invalid or expired token.")
    return payload

# --- Company Endpoints ---

@router.post("/companies", response_model=CompanyResponseSchema)
async def create_company(
    data: CompanyCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await company_service.create_company(db, data)

@router.get("/companies", response_model=list[CompanyResponseSchema])
async def list_companies(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await company_service.get_companies(db)

# IMPORTANT: static-prefix route must come BEFORE /{company_id}
@router.get("/companies/suspended", response_model=list[CompanyResponseSchema])
async def list_suspended_companies(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """List suspended companies (candidates for reactivation)."""
    return await company_service.get_suspended_companies(db)

@router.get("/companies/{company_id}", response_model=CompanyResponseSchema)
async def get_company(
    company_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await company_service.get_company(db, company_id)

@router.put("/companies/{company_id}", response_model=CompanyResponseSchema)
async def update_company(
    company_id: str,
    data: CompanyUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await company_service.update_company(db, company_id, data)

@router.put("/companies/{company_id}/suspend", response_model=CompanyResponseSchema)
async def suspend_company(
    company_id: str,
    data: AdminPasswordSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Suspend a company and disable login for its active employees."""
    return await company_service.suspend_company(
        db, company_id=company_id, admin_id=current_user["sub"], admin_password=data.admin_password
    )

@router.put("/companies/{company_id}/reactivate", response_model=CompanyResponseSchema)
async def reactivate_company(
    company_id: str,
    data: AdminPasswordSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Reactivate a suspended company and restore login for its active employees."""
    return await company_service.reactivate_company(
        db, company_id=company_id, admin_id=current_user["sub"], admin_password=data.admin_password
    )

@router.delete("/companies/{company_id}")
async def delete_company(
    company_id: str,
    data: AdminPasswordSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Hard-delete an empty company (no branches, no employees)."""
    await company_service.delete_company(
        db, company_id=company_id, admin_id=current_user["sub"], admin_password=data.admin_password
    )
    return {"message": "Company deleted."}

# --- Branch Endpoints ---

@router.post("/companies/{company_id}/branches", response_model=BranchResponseSchema)
async def create_branch(
    company_id: str,
    data: BranchCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    data.company_id = company_id
    return await company_service.create_branch(db, data)

@router.get("/companies/{company_id}/branches", response_model=list[BranchResponseSchema])
async def list_branches(
    company_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await company_service.get_branches(db, company_id)

# IMPORTANT: static-prefix route must come BEFORE /{branch_id}
@router.get("/companies/{company_id}/branches/suspended", response_model=list[BranchResponseSchema])
async def list_suspended_branches(
    company_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """List suspended branches of a company (candidates for reactivation)."""
    return await company_service.get_suspended_branches(db, company_id)

@router.get("/branches/{branch_id}", response_model=BranchResponseSchema)
async def get_branch(
    branch_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await company_service.get_branch(db, branch_id)

@router.put("/branches/{branch_id}", response_model=BranchResponseSchema)
async def update_branch(
    branch_id: str,
    data: BranchUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await company_service.update_branch(db, branch_id, data)

@router.put("/branches/{branch_id}/suspend", response_model=BranchResponseSchema)
async def suspend_branch(
    branch_id: str,
    data: AdminPasswordSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Suspend a branch and disable login for its active employees."""
    return await company_service.suspend_branch(
        db, branch_id=branch_id, admin_id=current_user["sub"], admin_password=data.admin_password
    )

@router.put("/branches/{branch_id}/reactivate", response_model=BranchResponseSchema)
async def reactivate_branch(
    branch_id: str,
    data: AdminPasswordSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Reactivate a suspended branch and restore login for its active employees."""
    return await company_service.reactivate_branch(
        db, branch_id=branch_id, admin_id=current_user["sub"], admin_password=data.admin_password
    )

@router.delete("/branches/{branch_id}")
async def delete_branch(
    branch_id: str,
    data: AdminPasswordSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Hard-delete an empty branch (no employees)."""
    await company_service.delete_branch(
        db, branch_id=branch_id, admin_id=current_user["sub"], admin_password=data.admin_password
    )
    return {"message": "Branch deleted."}
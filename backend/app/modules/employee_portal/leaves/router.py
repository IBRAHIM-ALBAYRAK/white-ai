"""
app/modules/employee_portal/leaves/router.py

================================================================================
LEAVE MANAGEMENT — API Router (HTTP Layer)
================================================================================

Thin HTTP layer over leave_service. Authenticates, parses, delegates.

ENDPOINTS:
    POST   /api/v1/leaves                      → employee submits a leave request
    GET    /api/v1/leaves/employee/{id}        → list one employee's requests
    GET    /api/v1/leaves/branch/{id}          → list all requests in a branch (manager)
    GET    /api/v1/leaves/branch/{id}/pending  → manager's approval queue (pending only)
    GET    /api/v1/leaves/{id}                 → get a single request
    PUT    /api/v1/leaves/{id}/review          → manager approves/rejects
    PUT    /api/v1/leaves/{id}/cancel          → employee cancels own pending request

TENANT ISOLATION:
    - Employee-facing (create / list-by-employee / cancel): assert_employee_access
      keeps a plain employee to their OWN profile; for admins we additionally
      apply assert_employee_company_access so an admin is scoped to companies
      they can access.
    - Branch reads: assert_branch_access.
    - Single-leave endpoints (get / review): _assert_leave resolves the leave's
      employee → company and checks access.
================================================================================
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import (
    get_current_user, require_role,
    assert_employee_access, assert_branch_access, assert_employee_company_access,
)
from app.modules.auth.models import User, UserRole
from app.modules.employee_portal.leaves.schemas import (
    LeaveCreateSchema,
    LeaveReviewSchema,
    LeaveResponseSchema,
)
from app.modules.employee_portal.leaves.service import leave_service

router = APIRouter(prefix="/leaves", tags=["Leaves"])

staff = require_role(UserRole.SUPERADMIN, UserRole.OWNER, UserRole.MANAGER)
ADMIN_ROLES = (UserRole.SUPERADMIN, UserRole.OWNER, UserRole.MANAGER)


class CancelLeaveSchema(BaseModel):
    """Body for cancel — the employee_id of the owner making the cancellation."""
    employee_id: str


async def _assert_leave(db: AsyncSession, current_user: User, leave_id: str) -> None:
    """Resolve a leave's employee → company and assert the caller can access it."""
    leave = await leave_service.get_leave(db, leave_id)
    await assert_employee_company_access(db, current_user, leave.employee_id)


@router.post("", response_model=LeaveResponseSchema)
async def create_leave(
    data: LeaveCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await assert_employee_access(db, current_user, data.employee_id)
    if current_user.role in ADMIN_ROLES:
        await assert_employee_company_access(db, current_user, data.employee_id)
    return await leave_service.create_leave(db, data)


@router.get("/employee/{employee_id}", response_model=list[LeaveResponseSchema])
async def list_by_employee(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await assert_employee_access(db, current_user, employee_id)
    if current_user.role in ADMIN_ROLES:
        await assert_employee_company_access(db, current_user, employee_id)
    return await leave_service.get_by_employee(db, employee_id)


@router.get("/branch/{branch_id}", response_model=list[LeaveResponseSchema])
async def list_by_branch(
    branch_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await assert_branch_access(db, current_user, branch_id)
    return await leave_service.get_by_branch(db, branch_id)


@router.get("/branch/{branch_id}/pending", response_model=list[LeaveResponseSchema])
async def list_pending_by_branch(
    branch_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await assert_branch_access(db, current_user, branch_id)
    return await leave_service.get_pending_by_branch(db, branch_id)


@router.get("/{leave_id}", response_model=LeaveResponseSchema)
async def get_leave(
    leave_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await _assert_leave(db, current_user, leave_id)
    return await leave_service.get_leave(db, leave_id)


@router.put("/{leave_id}/review", response_model=LeaveResponseSchema)
async def review_leave(
    leave_id: str,
    data: LeaveReviewSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await _assert_leave(db, current_user, leave_id)
    return await leave_service.review_leave(
        db,
        leave_id=leave_id,
        reviewer_id=current_user.id,
        data=data,
    )


@router.put("/{leave_id}/cancel", response_model=LeaveResponseSchema)
async def cancel_leave(
    leave_id: str,
    data: CancelLeaveSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await assert_employee_access(db, current_user, data.employee_id)
    if current_user.role in ADMIN_ROLES:
        await assert_employee_company_access(db, current_user, data.employee_id)
    return await leave_service.cancel_leave(
        db,
        leave_id=leave_id,
        employee_id=data.employee_id,
    )
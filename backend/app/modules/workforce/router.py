"""
app/modules/workforce/router.py

Workforce (shift) management endpoints.

Tenant isolation + oversight:
  - Reads (list/get shift, employee shifts): assert_branch_access / shift->branch.
    A brand may VIEW a franchise's shifts (oversight); employees see only their own.
  - Writes (create/update/delete/assign): assert_shift_write_access — a franchise
    manages its OWN shifts freely, but a brand CANNOT write to a franchise's shifts
    (advice-only); own/full/standalone are free.
  - Employee-facing (own shifts, update own assignment): assert_employee_access
    (ownership) plus tenant scope for admins.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import (
    get_current_user, require_role,
    assert_employee_access, assert_branch_access,
    assert_shift_write_access, assert_employee_company_access,
)
from app.modules.auth.models import User, UserRole
from app.modules.workforce.models import Shift, ShiftAssignment
from app.modules.workforce.schemas import (
    ShiftCreateSchema,
    ShiftUpdateSchema,
    ShiftAssignSchema,
    AssignmentUpdateSchema,
    ShiftResponseSchema,
    AssignmentResponseSchema,
)
from app.modules.workforce.service import workforce_service

router = APIRouter(tags=["Workforce Management"])

staff = require_role(UserRole.SUPERADMIN, UserRole.OWNER, UserRole.MANAGER)
ADMIN_ROLES = (UserRole.SUPERADMIN, UserRole.OWNER, UserRole.MANAGER)


async def _shift_branch(db: AsyncSession, shift_id: str) -> str:
    """Resolve a shift's branch_id (404 if missing)."""
    branch_id = (await db.execute(
        select(Shift.branch_id).where(Shift.id == shift_id)
    )).scalar_one_or_none()
    if branch_id is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shift not found.")
    return branch_id


@router.post("/shifts", response_model=ShiftResponseSchema)
async def create_shift(
    data: ShiftCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await assert_shift_write_access(db, current_user, data.branch_id)
    return await workforce_service.create_shift(db, current_user.id, data)


@router.get("/shifts/branch/{branch_id}", response_model=list[ShiftResponseSchema])
async def list_shifts(
    branch_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await assert_branch_access(db, current_user, branch_id)
    return await workforce_service.get_shifts(db, branch_id)


@router.get("/shifts/employee/{employee_id}", response_model=list[ShiftResponseSchema])
async def employee_shifts(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await assert_employee_access(db, current_user, employee_id)
    if current_user.role in ADMIN_ROLES:
        await assert_employee_company_access(db, current_user, employee_id)
    return await workforce_service.get_employee_shifts(db, employee_id)


@router.get("/shifts/{shift_id}", response_model=ShiftResponseSchema)
async def get_shift(
    shift_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    branch_id = await _shift_branch(db, shift_id)
    await assert_branch_access(db, current_user, branch_id)
    return await workforce_service.get_shift(db, shift_id)


@router.put("/shifts/{shift_id}", response_model=ShiftResponseSchema)
async def update_shift(
    shift_id: str,
    data: ShiftUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    branch_id = await _shift_branch(db, shift_id)
    await assert_shift_write_access(db, current_user, branch_id)
    return await workforce_service.update_shift(db, shift_id, data)


@router.delete("/shifts/{shift_id}")
async def delete_shift(
    shift_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    branch_id = await _shift_branch(db, shift_id)
    await assert_shift_write_access(db, current_user, branch_id)
    await workforce_service.delete_shift(db, shift_id)
    return {"message": "Shift deleted."}


@router.post("/shifts/{shift_id}/assign", response_model=list[AssignmentResponseSchema])
async def assign_employees(
    shift_id: str,
    data: ShiftAssignSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    branch_id = await _shift_branch(db, shift_id)
    await assert_shift_write_access(db, current_user, branch_id)
    return await workforce_service.assign_employees(db, shift_id, data)


@router.put("/assignments/{assignment_id}", response_model=AssignmentResponseSchema)
async def update_assignment(
    assignment_id: str,
    data: AssignmentUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Resolve the assignment's owner, then enforce ownership (plain employee = own;
    # admins additionally tenant-scoped).
    target = (
        await db.execute(
            select(ShiftAssignment.employee_id).where(ShiftAssignment.id == assignment_id)
        )
    ).scalar_one_or_none()
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found.")
    await assert_employee_access(db, current_user, target)
    if current_user.role in ADMIN_ROLES:
        await assert_employee_company_access(db, current_user, target)
    return await workforce_service.update_assignment(db, assignment_id, data)


# ============================================================================
# Shift Templates — manager-defined reusable shift types (branch-scoped)
# ============================================================================
from app.modules.workforce.models import ShiftTemplate
from app.modules.workforce.schemas import ShiftTemplateCreateSchema, ShiftTemplateResponseSchema
from sqlalchemy import select as _select


@router.get("/shift-templates/branch/{branch_id}", response_model=list[ShiftTemplateResponseSchema])
async def list_shift_templates(
    branch_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await assert_branch_access(db, current_user, branch_id)
    rows = (await db.execute(
        _select(ShiftTemplate).where(ShiftTemplate.branch_id == branch_id).order_by(ShiftTemplate.start_label)
    )).scalars().all()
    return rows


@router.post("/shift-templates", response_model=ShiftTemplateResponseSchema)
async def create_shift_template(
    data: ShiftTemplateCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await assert_branch_access(db, current_user, data.branch_id)
    tpl = ShiftTemplate(
        branch_id=data.branch_id, name=data.name,
        start_label=data.start_label, end_label=data.end_label, color=data.color,
    )
    db.add(tpl)
    await db.flush()
    await db.commit()
    await db.refresh(tpl)
    return tpl


@router.delete("/shift-templates/{template_id}")
async def delete_shift_template(
    template_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    tpl = (await db.execute(_select(ShiftTemplate).where(ShiftTemplate.id == template_id))).scalar_one_or_none()
    if tpl is None:
        raise HTTPException(status_code=404, detail="Template not found.")
    await assert_branch_access(db, current_user, tpl.branch_id)
    await db.delete(tpl)
    await db.commit()
    return {"deleted": True}

"""
app/modules/workforce/router.py

Workforce (shift) management endpoints. Role-based access:
  - Management (create/update/delete/assign shifts, branch list, single shift):
    superadmin, owner, manager.
  - Employee-facing (own shifts, confirm/reject own assignment): caller must own
    the relevant employee id via assert_employee_access — #9.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user, require_role, assert_employee_access
from app.modules.auth.models import User, UserRole
from app.modules.workforce.models import ShiftAssignment
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


@router.post("/shifts", response_model=ShiftResponseSchema)
async def create_shift(
    data: ShiftCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    return await workforce_service.create_shift(db, current_user.id, data)


@router.get("/shifts/branch/{branch_id}", response_model=list[ShiftResponseSchema])
async def list_shifts(
    branch_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    return await workforce_service.get_shifts(db, branch_id)


@router.get("/shifts/employee/{employee_id}", response_model=list[ShiftResponseSchema])
async def employee_shifts(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await assert_employee_access(db, current_user, employee_id)
    return await workforce_service.get_employee_shifts(db, employee_id)


@router.get("/shifts/{shift_id}", response_model=ShiftResponseSchema)
async def get_shift(
    shift_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    return await workforce_service.get_shift(db, shift_id)


@router.put("/shifts/{shift_id}", response_model=ShiftResponseSchema)
async def update_shift(
    shift_id: str,
    data: ShiftUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    return await workforce_service.update_shift(db, shift_id, data)


@router.delete("/shifts/{shift_id}")
async def delete_shift(
    shift_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await workforce_service.delete_shift(db, shift_id)
    return {"message": "Shift deleted."}


@router.post("/shifts/{shift_id}/assign", response_model=list[AssignmentResponseSchema])
async def assign_employees(
    shift_id: str,
    data: ShiftAssignSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    return await workforce_service.assign_employees(db, shift_id, data)


@router.put("/assignments/{assignment_id}", response_model=AssignmentResponseSchema)
async def update_assignment(
    assignment_id: str,
    data: AssignmentUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Resolve the assignment's owner, then enforce ownership (admins bypass).
    target = (
        await db.execute(
            select(ShiftAssignment.employee_id).where(ShiftAssignment.id == assignment_id)
        )
    ).scalar_one_or_none()
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found.")
    await assert_employee_access(db, current_user, target)
    return await workforce_service.update_assignment(db, assignment_id, data)
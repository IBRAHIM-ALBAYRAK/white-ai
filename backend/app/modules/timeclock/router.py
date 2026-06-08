"""
app/modules/timeclock/router.py

Time Clock endpoints. Role-based access:
  - Operational (checkin/checkout/adjust/flag) + branch reads: superadmin, owner, manager
  - GET /employee/{employee_id}/{branch_id}: EMPLOYEE-FACING (portal attendance);
    a plain employee may read ONLY their own records; admins are tenant-scoped.

Tenant isolation:
  - branch_id-bearing endpoints  -> assert_branch_access
  - record_id-bearing endpoints  -> _assert_record (record -> branch -> access)
  - employee_records: assert_employee_access (own-profile for plain employees)
    PLUS assert_employee_company_access (tenant scope for admins).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import (
    get_current_user, require_role,
    assert_employee_access, assert_branch_access, assert_employee_company_access,
)
from app.modules.auth.models import User, UserRole
from app.modules.timeclock.models import TimeRecord
from app.modules.timeclock.schemas import (
    CheckInSchema,
    CheckOutSchema,
    AdjustRecordSchema,
    TimeRecordResponseSchema,
)
from app.modules.timeclock.service import timeclock_service

router = APIRouter(prefix="/timeclock", tags=["Time Clock"])

staff = require_role(UserRole.SUPERADMIN, UserRole.OWNER, UserRole.MANAGER)


async def _assert_record(db: AsyncSession, current_user: User, record_id: str) -> None:
    """Resolve a time record's branch and assert the caller can access that branch."""
    rec = (await db.execute(
        select(TimeRecord).where(TimeRecord.id == record_id)
    )).scalar_one_or_none()
    if rec is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Time record not found.")
    await assert_branch_access(db, current_user, rec.branch_id)


@router.post("/checkin", response_model=TimeRecordResponseSchema)
async def check_in(
    data: CheckInSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await assert_branch_access(db, current_user, data.branch_id)
    return await timeclock_service.check_in(db, data)


@router.post("/checkout/{record_id}", response_model=TimeRecordResponseSchema)
async def check_out(
    record_id: str,
    data: CheckOutSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await _assert_record(db, current_user, record_id)
    return await timeclock_service.check_out(db, record_id, data)


@router.get("/branch/{branch_id}", response_model=list[TimeRecordResponseSchema])
async def branch_records(
    branch_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await assert_branch_access(db, current_user, branch_id)
    return await timeclock_service.get_branch_records(db, branch_id)


@router.get("/branch/{branch_id}/open", response_model=list[TimeRecordResponseSchema])
async def open_records(
    branch_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await assert_branch_access(db, current_user, branch_id)
    return await timeclock_service.get_open_records(db, branch_id)


@router.get("/employee/{employee_id}/{branch_id}", response_model=list[TimeRecordResponseSchema])
async def employee_records(
    employee_id: str,
    branch_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Plain employee: own profile only. Admin: tenant-scoped to accessible companies.
    await assert_employee_access(db, current_user, employee_id)
    if current_user.role in (UserRole.SUPERADMIN, UserRole.OWNER, UserRole.MANAGER):
        await assert_employee_company_access(db, current_user, employee_id)
    return await timeclock_service.get_employee_records(db, employee_id, branch_id)


@router.put("/adjust/{record_id}", response_model=TimeRecordResponseSchema)
async def adjust_record(
    record_id: str,
    data: AdjustRecordSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await _assert_record(db, current_user, record_id)
    return await timeclock_service.adjust_record(db, record_id, data)


@router.put("/flag/{record_id}", response_model=TimeRecordResponseSchema)
async def flag_missing_checkout(
    record_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await _assert_record(db, current_user, record_id)
    return await timeclock_service.flag_missing_checkout(db, record_id)
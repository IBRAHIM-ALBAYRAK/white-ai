"""
app/modules/timeclock/router.py

API endpoints for Time Clock module.
All routes are protected — only authenticated users can access them.

Endpoints:
  POST   /timeclock/checkin                          — Employee checks in
  POST   /timeclock/checkout/{record_id}             — Employee checks out
  GET    /timeclock/branch/{branch_id}               — All records for a branch
  GET    /timeclock/branch/{branch_id}/open          — Currently open records
  GET    /timeclock/employee/{employee_id}/{branch_id} — Records for an employee
  PUT    /timeclock/adjust/{record_id}               — Manager adjusts a record
  PUT    /timeclock/flag/{record_id}                 — Flag missing checkout
"""

from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedException
from app.modules.timeclock.schemas import (
    CheckInSchema,
    CheckOutSchema,
    AdjustRecordSchema,
    TimeRecordResponseSchema,
)
from app.modules.timeclock.service import timeclock_service

router = APIRouter(prefix="/timeclock", tags=["Time Clock"])
security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = decode_token(credentials.credentials)
    if not payload:
        raise UnauthorizedException("Invalid or expired token.")
    return payload


@router.post("/checkin", response_model=TimeRecordResponseSchema)
async def check_in(
    data: CheckInSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await timeclock_service.check_in(db, data)


@router.post("/checkout/{record_id}", response_model=TimeRecordResponseSchema)
async def check_out(
    record_id: str,
    data: CheckOutSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await timeclock_service.check_out(db, record_id, data)


@router.get("/branch/{branch_id}", response_model=list[TimeRecordResponseSchema])
async def branch_records(
    branch_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await timeclock_service.get_branch_records(db, branch_id)


@router.get("/branch/{branch_id}/open", response_model=list[TimeRecordResponseSchema])
async def open_records(
    branch_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await timeclock_service.get_open_records(db, branch_id)


@router.get("/employee/{employee_id}/{branch_id}", response_model=list[TimeRecordResponseSchema])
async def employee_records(
    employee_id: str,
    branch_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await timeclock_service.get_employee_records(db, employee_id, branch_id)


@router.put("/adjust/{record_id}", response_model=TimeRecordResponseSchema)
async def adjust_record(
    record_id: str,
    data: AdjustRecordSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await timeclock_service.adjust_record(db, record_id, data)


@router.put("/flag/{record_id}", response_model=TimeRecordResponseSchema)
async def flag_missing_checkout(
    record_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await timeclock_service.flag_missing_checkout(db, record_id)
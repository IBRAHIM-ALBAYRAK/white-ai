"""
app/modules/workforce/router.py

Defines the API endpoints for Workforce Management.
All routes are protected — only authenticated users can access them.

Endpoints:
  POST   /shifts                              — Create a new shift
  GET    /shifts/branch/{branch_id}           — List all shifts for a branch
  GET    /shifts/{shift_id}                   — Get a single shift
  PUT    /shifts/{shift_id}                   — Update a shift
  DELETE /shifts/{shift_id}                   — Delete a cancelled shift
  POST   /shifts/{shift_id}/assign            — Assign employees to a shift
  PUT    /assignments/{assignment_id}         — Employee confirms or rejects shift
  GET    /shifts/employee/{employee_id}       — Get all shifts for an employee
"""

from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedException
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
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = decode_token(credentials.credentials)
    if not payload:
        raise UnauthorizedException("Invalid or expired token.")
    return payload

@router.post("/shifts", response_model=ShiftResponseSchema)
async def create_shift(
    data: ShiftCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await workforce_service.create_shift(db, current_user["sub"], data)

@router.get("/shifts/branch/{branch_id}", response_model=list[ShiftResponseSchema])
async def list_shifts(
    branch_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await workforce_service.get_shifts(db, branch_id)

@router.get("/shifts/employee/{employee_id}", response_model=list[ShiftResponseSchema])
async def employee_shifts(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await workforce_service.get_employee_shifts(db, employee_id)

@router.get("/shifts/{shift_id}", response_model=ShiftResponseSchema)
async def get_shift(
    shift_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await workforce_service.get_shift(db, shift_id)

@router.put("/shifts/{shift_id}", response_model=ShiftResponseSchema)
async def update_shift(
    shift_id: str,
    data: ShiftUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await workforce_service.update_shift(db, shift_id, data)

@router.delete("/shifts/{shift_id}")
async def delete_shift(
    shift_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    await workforce_service.delete_shift(db, shift_id)
    return {"message": "Shift deleted."}

@router.post("/shifts/{shift_id}/assign", response_model=list[AssignmentResponseSchema])
async def assign_employees(
    shift_id: str,
    data: ShiftAssignSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await workforce_service.assign_employees(db, shift_id, data)

@router.put("/assignments/{assignment_id}", response_model=AssignmentResponseSchema)
async def update_assignment(
    assignment_id: str,
    data: AssignmentUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await workforce_service.update_assignment(db, assignment_id, data)
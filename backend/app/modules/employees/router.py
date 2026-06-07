"""
app/modules/employees/router.py

Defines the API endpoints for Employee management.
All routes are protected — only authenticated users can access them.

Employees are distinct from Users: a User is an auth identity (email + password
+ role), while an Employee is a workforce profile (company_id, branch_id, salary,
tc_no, sgk_no, bank_iban, …). An Employee MAY be linked to a User (user_id) so
the person can log in to the Employee Portal, but it is not required.

Termination is a soft action (is_active=False + termination_date) so historical
records (timeclock, payroll) are preserved — never a hard delete.

Endpoints:
  POST   /employees                          — Create an employee (optionally with a login account)
  GET    /employees/branch/{branch_id}       — List ACTIVE employees of a branch
  GET    /employees/branch/{branch_id}/inactive — List terminated employees of a branch (rehire list)
  GET    /employees/by-user/{user_id}        — Resolve the employee profile for a logged-in user
  GET    /employees/{employee_id}            — Get a single employee
  PUT    /employees/{employee_id}            — Update an employee profile
  DELETE /employees/{employee_id}/terminate  — Terminate an employee (admin password)
  PUT    /employees/{employee_id}/reactivate — Reactivate (rehire) a terminated employee
"""

from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedException
from app.modules.employees.schemas import (
    EmployeeCreateSchema, EmployeeUpdateSchema, EmployeeResponseSchema,
)
from app.modules.employees.service import employee_service

router = APIRouter(tags=["Employees"])
security = HTTPBearer()


class TerminateSchema(BaseModel):
    """Body for admin-password-protected employee termination."""
    admin_password: str


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = decode_token(credentials.credentials)
    if not payload:
        raise UnauthorizedException("Invalid or expired token.")
    return payload


# --- Create ---

@router.post("/employees", response_model=EmployeeResponseSchema)
async def create_employee(
    data: EmployeeCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await employee_service.create_employee(db, data)


# --- List / resolve (static-prefix routes BEFORE /{employee_id}) ---

@router.get("/employees/branch/{branch_id}", response_model=list[EmployeeResponseSchema])
async def list_employees_by_branch(
    branch_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await employee_service.get_employees_by_branch(db, branch_id)


@router.get("/employees/branch/{branch_id}/inactive", response_model=list[EmployeeResponseSchema])
async def list_inactive_employees_by_branch(
    branch_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await employee_service.get_inactive_by_branch(db, branch_id)


@router.get("/employees/by-user/{user_id}", response_model=EmployeeResponseSchema)
async def get_employee_by_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await employee_service.get_by_user_id(db, user_id)


# --- Single / update ---

@router.get("/employees/{employee_id}", response_model=EmployeeResponseSchema)
async def get_employee(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await employee_service.get_employee(db, employee_id)


@router.put("/employees/{employee_id}", response_model=EmployeeResponseSchema)
async def update_employee(
    employee_id: str,
    data: EmployeeUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await employee_service.update_employee(db, employee_id, data)


# --- Terminate / reactivate ---

@router.delete("/employees/{employee_id}/terminate")
async def terminate_employee(
    employee_id: str,
    data: TerminateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Terminate an employee (soft). Requires the acting admin's password."""
    await employee_service.terminate_employee(
        db,
        employee_id=employee_id,
        admin_id=current_user["sub"],
        admin_password=data.admin_password,
    )
    return {"message": "Employee terminated."}


@router.put("/employees/{employee_id}/reactivate", response_model=EmployeeResponseSchema)
async def reactivate_employee(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Reactivate (rehire) a terminated employee."""
    return await employee_service.reactivate_employee(db, employee_id)
"""
app/modules/employees/router.py

Employee (workforce profile) management. PII lives here: tc_no, sgk_no,
bank_iban, salary. Role-based access:
  - Writes (create/update/terminate/reactivate): superadmin, owner
  - Reads  (list / get by employee_id): superadmin, owner, manager
  - by-user/{user_id}: any logged-in user, but a non-admin may resolve ONLY
    their own profile (ownership check) — this is what the Employee Portal uses.
NOTE: tenant/branch scoping (manager limited to own branch) is a later fix (#5b).

Employees are distinct from Users: a User is an auth identity; an Employee is a
workforce profile optionally linked to a User via user_id.
Termination is soft (is_active=False + termination_date) to preserve history.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user, require_role, assert_branch_access, assert_employee_company_access, assert_employee_write_access
from app.modules.auth.models import User, UserRole
from app.modules.employees.schemas import (
    EmployeeCreateSchema, EmployeeUpdateSchema, EmployeeResponseSchema,
)
from app.modules.employees.service import employee_service

router = APIRouter(tags=["Employees"])

admin_write = require_role(UserRole.SUPERADMIN, UserRole.OWNER, UserRole.MANAGER)
admin_read = require_role(UserRole.SUPERADMIN, UserRole.OWNER, UserRole.MANAGER)
ADMIN_ROLES = (UserRole.SUPERADMIN, UserRole.OWNER, UserRole.MANAGER)


class TerminateSchema(BaseModel):
    """Body for admin-password-protected employee termination."""
    admin_password: str


# --- Create ---

@router.post("/employees", response_model=EmployeeResponseSchema)
async def create_employee(
    data: EmployeeCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_write),
):
    if data.branch_id:
        await assert_branch_access(db, current_user, data.branch_id)
    return await employee_service.create_employee(db, data)


# --- List / resolve (static-prefix routes BEFORE /{employee_id}) ---

@router.get("/employees/branch/{branch_id}", response_model=list[EmployeeResponseSchema])
async def list_employees_by_branch(
    branch_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_read),
):
    await assert_branch_access(db, current_user, branch_id)
    return await employee_service.get_employees_by_branch(db, branch_id)


@router.get("/employees/branch/{branch_id}/inactive", response_model=list[EmployeeResponseSchema])
async def list_inactive_employees_by_branch(
    branch_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_read),
):
    await assert_branch_access(db, current_user, branch_id)
    return await employee_service.get_inactive_by_branch(db, branch_id)


@router.get("/employees/by-user/{user_id}", response_model=EmployeeResponseSchema)
async def get_employee_by_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # A non-admin may resolve ONLY their own profile; admins may resolve anyone's.
    if current_user.role not in ADMIN_ROLES and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own profile.",
        )
    return await employee_service.get_by_user_id(db, user_id)


# --- Single / update ---

@router.get("/employees/{employee_id}", response_model=EmployeeResponseSchema)
async def get_employee(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_read),
):
    await assert_employee_company_access(db, current_user, employee_id)
    return await employee_service.get_employee(db, employee_id)


@router.put("/employees/{employee_id}", response_model=EmployeeResponseSchema)
async def update_employee(
    employee_id: str,
    data: EmployeeUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_write),
):
    await assert_employee_write_access(db, current_user, employee_id)
    return await employee_service.update_employee(db, employee_id, data)


# --- Terminate / reactivate ---

@router.delete("/employees/{employee_id}/terminate")
async def terminate_employee(
    employee_id: str,
    data: TerminateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_write),
):
    """Terminate an employee (soft). Requires the acting admin's password."""
    await assert_employee_write_access(db, current_user, employee_id)
    await employee_service.terminate_employee(
        db,
        employee_id=employee_id,
        admin_id=current_user.id,
        admin_password=data.admin_password,
    )
    return {"message": "Employee terminated."}


@router.put("/employees/{employee_id}/reactivate", response_model=EmployeeResponseSchema)
async def reactivate_employee(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_write),
):
    """Reactivate (rehire) a terminated employee."""
    await assert_employee_write_access(db, current_user, employee_id)
    return await employee_service.reactivate_employee(db, employee_id)


# --- Mevcut calisana giris hesabi ac (sonradan) ---
class CreateAccountSchema(BaseModel):
    email: EmailStr
    password: str
    role: str = "employee"


@router.post("/employees/{employee_id}/create-account", response_model=EmployeeResponseSchema)
async def create_account_for_employee(
    employee_id: str,
    data: CreateAccountSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_write),
):
    await assert_employee_write_access(db, current_user, employee_id)
    return await employee_service.create_account_for_employee(
        db, employee_id, data.email, data.password, data.role
    )

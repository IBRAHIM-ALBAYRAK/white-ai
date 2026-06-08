"""
app/modules/payroll/router.py

Payroll endpoints.
  POST /payroll/run            -> calculate & store one month   (staff only)
  POST /payroll/run-through    -> fill chain_start..month        (staff only)
  GET  /payroll/employee/{id}/{year}  -> stored payslips for a year

Read access (GET) rule:
  - Admins (superadmin, owner, manager) may read any employee's payslips.
  - A plain employee may read ONLY their own payslips (employee_id must match
    the employee profile linked to their user account). This lets the Employee
    Portal show the worker their own payroll without exposing others'.
Write access (POST) is staff-only: employees can view but never run payroll.
Tenant scoping (manager limited to own branch) is a later concern (#5b).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import require_role, get_current_user, assert_employee_company_access, assert_payroll_access
from app.modules.auth.models import User, UserRole
from app.modules.payroll.schemas import RunMonthSchema, PayslipResponseSchema
from app.modules.payroll.service import payroll_service
from app.modules.employees.service import employee_service

router = APIRouter(prefix="/payroll", tags=["Payroll"])

staff = require_role(UserRole.SUPERADMIN, UserRole.OWNER, UserRole.MANAGER)
ADMIN_ROLES = (UserRole.SUPERADMIN, UserRole.OWNER, UserRole.MANAGER)


@router.post("/run", response_model=PayslipResponseSchema)
async def run_month(
    data: RunMonthSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await assert_payroll_access(db, current_user, data.employee_id)
    return await payroll_service.run_month(db, data.employee_id, data.year, data.month)


@router.post("/run-through", response_model=list[PayslipResponseSchema])
async def run_through(
    data: RunMonthSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await assert_payroll_access(db, current_user, data.employee_id)
    return await payroll_service.run_through(db, data.employee_id, data.year, data.month)


@router.get("/employee/{employee_id}/{year}", response_model=list[PayslipResponseSchema])
async def get_year(
    employee_id: str,
    year: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Admins may read payslips ONLY within companies they can access. 
    # A plain employee may read ONLY their own payslips.
    if current_user.role in ADMIN_ROLES:
        await assert_payroll_access(db, current_user, employee_id)
    else:
        own = await employee_service.get_by_user_id(db, current_user.id)
        if own.id != employee_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own payslips.",
            )
    return await payroll_service.get_year(db, employee_id, year)
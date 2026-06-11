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

# ── Branch-level bulk endpoints (subenin donem bordrosu) ──
from sqlalchemy import select
from app.modules.employees.models import Employee
from app.modules.company.models import Branch
from app.modules.payroll.models import Payslip
from app.modules.payroll.schemas import RunBranchSchema, EmployeePayrollRowSchema, RunBranchResultSchema


async def _assert_own_branch(db: AsyncSession, current_user: User, branch_id: str) -> Branch:
    """Bordro yalnizca markanin KENDI subeleri icin: franchise/oversight 403."""
    branch = (await db.execute(select(Branch).where(Branch.id == branch_id))).scalar_one_or_none()
    if branch is None:
        raise HTTPException(status_code=404, detail="Branch not found.")
    if current_user.role != UserRole.SUPERADMIN and branch.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="Payroll is outside oversight scope.")
    return branch


@router.get("/branch/{branch_id}/{year}/{month}", response_model=list[EmployeePayrollRowSchema])
async def get_branch_month(
    branch_id: str, year: int, month: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await _assert_own_branch(db, current_user, branch_id)
    emps = (await db.execute(
        select(Employee).where(Employee.branch_id == branch_id, Employee.is_active == True).order_by(Employee.first_name)
    )).scalars().all()
    ids = [e.id for e in emps]
    slips = {}
    if ids:
        rows = (await db.execute(
            select(Payslip).where(Payslip.employee_id.in_(ids), Payslip.year == year, Payslip.month == month)
        )).scalars().all()
        slips = {p.employee_id: p for p in rows}
    return [
        EmployeePayrollRowSchema(
            employee_id=e.id, first_name=e.first_name, last_name=e.last_name,
            position=e.position, base_salary=e.base_salary,
            payslip=slips.get(e.id),
        )
        for e in emps
    ]


@router.post("/run-branch", response_model=list[RunBranchResultSchema])
async def run_branch(
    data: RunBranchSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await _assert_own_branch(db, current_user, data.branch_id)
    emps = (await db.execute(
        select(Employee).where(Employee.branch_id == data.branch_id, Employee.is_active == True).order_by(Employee.first_name)
    )).scalars().all()
    emp_ids = [e.id for e in emps]  # rollback ORM objelerini expire eder — id'leri onceden kopyala
    results: list[RunBranchResultSchema] = []
    for eid in emp_ids:
        try:
            slips = await payroll_service.run_through(db, eid, data.year, data.month)
            # commit de expire eder — schema'ya commit'ten ONCE cevir
            last = PayslipResponseSchema.model_validate(slips[-1]) if slips else None
            await db.commit()
            results.append(RunBranchResultSchema(employee_id=eid, ok=True, payslip=last))
        except HTTPException as ex:
            await db.rollback()
            results.append(RunBranchResultSchema(employee_id=eid, ok=False, error=str(ex.detail)))
        except Exception:
            await db.rollback()
            results.append(RunBranchResultSchema(employee_id=eid, ok=False, error="Hesaplama hatasi."))
    return results

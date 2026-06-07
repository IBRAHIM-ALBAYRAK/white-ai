"""
app/modules/payroll/service.py

Stateful payroll service. Orchestrates:
  - load date-versioned parameters (rates, min wage, brackets) for the period
  - compute SGK days for the month from the employee's hire_date (parmak hesabı)
  - STRICT cumulative chain: read prior cumulative from the previous month's
    stored payslip; refuse if a required prior month is missing
  - call the pure engine, persist/update the payslips row
  - read back stored payslips

V1 SCOPE: monthly-salaried, full-time. Hire month is prorated by SGK days.
Termination/unpaid-leave/sick-day proration is out of scope (later).
Future months cannot be run. Employees not yet hired cannot be run.
"""

import calendar
from datetime import date
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import NotFoundException
from fastapi import HTTPException, status

from app.modules.employees.models import Employee
from app.modules.payroll.models import (
    MinimumWage, PayrollRate, IncomeTaxBracket, Payslip,
)
from app.modules.payroll.engine import calculate_monthly_payslip


# --- SGK day calculation (parmak hesabı) -------------------------------------

def sgk_days_for_month(hire_date, year: int, month: int) -> int:
    """
    SGK prim days for an employee in (year, month), V1 rules:
      - Full month is always 30 (regardless of calendar length).
      - Hire month, hired after the 1st: calendar_days - (hire_day - 1), capped 30.
      - Hired on the 1st (or hired before this month): full 30.
      - Hired after this month: 0 (should not be paid this month).
    """
    if hire_date is None:
        return 30
    if (year, month) < (hire_date.year, hire_date.month):
        return 0
    if year == hire_date.year and month == hire_date.month:
        if hire_date.day == 1:
            return 30
        cal_days = calendar.monthrange(year, month)[1]   # 28/29/30/31
        days = cal_days - (hire_date.day - 1)
        return min(days, 30)
    return 30


# --- Parameter loading -------------------------------------------------------

async def _load_params(db: AsyncSession, on_date: date):
    """Load the parameter rows valid on `on_date`."""
    mw_row = (await db.execute(
        select(MinimumWage).where(
            MinimumWage.effective_from <= on_date,
            (MinimumWage.effective_to == None) | (MinimumWage.effective_to >= on_date),
        )
    )).scalar_one_or_none()
    if mw_row is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"No minimum-wage parameter for {on_date}.")

    rate_rows = (await db.execute(
        select(PayrollRate).where(
            PayrollRate.effective_from <= on_date,
            (PayrollRate.effective_to == None) | (PayrollRate.effective_to >= on_date),
        )
    )).scalars().all()
    rates = {r.rate_key: float(r.rate_value) for r in rate_rows}
    required = {"sgk_isci", "issizlik_isci", "sgk_isveren", "issizlik_isveren", "damga", "sgk_tavan"}
    missing = required - rates.keys()
    if missing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Missing payroll rates for {on_date}: {sorted(missing)}.")

    bracket_rows = (await db.execute(
        select(IncomeTaxBracket).where(
            IncomeTaxBracket.effective_from <= on_date,
            (IncomeTaxBracket.effective_to == None) | (IncomeTaxBracket.effective_to >= on_date),
        ).order_by(IncomeTaxBracket.bracket_order)
    )).scalars().all()
    if not bracket_rows:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"No income-tax brackets for {on_date}.")
    brackets = [{
        "cumulative_min": float(b.cumulative_min),
        "cumulative_max": (float(b.cumulative_max) if b.cumulative_max is not None else None),
        "rate": float(b.rate),
        "fixed_amount": float(b.fixed_amount),
    } for b in bracket_rows]

    return mw_row, rates, brackets


# --- Cumulative chain (strict) -----------------------------------------------

def _chain_start_month(hire_date, year: int) -> int:
    """First payroll month of the chain in `year`: hire month if hired this year, else January."""
    if hire_date and hire_date.year == year:
        return hire_date.month
    return 1


async def _prior_payslip(db: AsyncSession, employee_id: str, year: int, month: int):
    """Return the payslip for the month immediately before (year, month), or None."""
    if month == 1:
        return None  # V1: single-year chains; no Dec-prev-year carry yet.
    return (await db.execute(
        select(Payslip).where(
            Payslip.employee_id == employee_id,
            Payslip.year == year,
            Payslip.month == month - 1,
        )
    )).scalar_one_or_none()


class PayrollService:

    async def run_month(self, db: AsyncSession, employee_id: str, year: int, month: int) -> Payslip:
        """
        Calculate and store one month's payslip for an employee.
        Strict chain: every month from chain_start..(month-1) must already exist.
        Re-running an existing month updates it.
        """
        if month < 1 or month > 12:
            raise HTTPException(status_code=400, detail="Month must be 1..12.")

        # Gelecek ay bordrosu çalıştırılamaz — ay henüz başlamadıysa reddet.
        today = date.today()
        if (year, month) > (today.year, today.month):
            raise HTTPException(
                status_code=400,
                detail=f"Cannot run payroll for a future month ({year}-{month:02d}).",
            )

        emp = (await db.execute(select(Employee).where(Employee.id == employee_id))).scalar_one_or_none()
        if emp is None:
            raise NotFoundException("Employee not found.")
        if emp.base_salary is None:
            raise HTTPException(status_code=400, detail="Employee has no base_salary (gross) set.")

        sgk_days = sgk_days_for_month(emp.hire_date, year, month)
        if sgk_days == 0:
            raise HTTPException(status_code=400,
                detail=f"Employee not employed in {year}-{month:02d} (hire_date {emp.hire_date}).")

        chain_start = _chain_start_month(emp.hire_date, year)
        if month < chain_start:
            raise HTTPException(status_code=400,
                detail=f"Month {month} is before the employee's first payroll month ({chain_start}).")

        if month == chain_start:
            prior_cum = 0.0
            mw_prior_cum = 0.0
        else:
            prev = await self._require_prev(db, employee_id, year, month, chain_start)
            prior_cum = float(prev.cumulative_base_after)
            mw_prior_cum = float(prev.mw_cumulative_base_after)

        on_date = date(year, month, 15)
        mw_row, rates, brackets = await _load_params(db, on_date)

        result = calculate_monthly_payslip(
            gross=float(emp.base_salary),
            prior_cumulative_base=prior_cum,
            rates=rates,
            min_wage_gross=float(mw_row.gross_monthly),
            brackets=brackets,
            min_wage_prior_cumulative_base=mw_prior_cum,
            sgk_days=sgk_days,
        )

        existing = (await db.execute(
            select(Payslip).where(
                Payslip.employee_id == employee_id,
                Payslip.year == year,
                Payslip.month == month,
            )
        )).scalar_one_or_none()

        data = result.as_dict()
        if existing is None:
            ps = Payslip(employee_id=employee_id, year=year, month=month, **data)
            db.add(ps)
            await db.flush()
            return ps
        else:
            for k, v in data.items():
                setattr(existing, k, v)
            db.add(existing)
            await db.flush()
            return existing

    async def run_through(self, db: AsyncSession, employee_id: str, year: int, month: int) -> list[Payslip]:
        """
        Run payroll from the employee's chain start up to and including `month`,
        filling in any missing prior months in order. Months that already exist
        are left untouched (their cumulative is reused). Returns all payslips
        for the year after the operation.
        """
        if month < 1 or month > 12:
            raise HTTPException(status_code=400, detail="Month must be 1..12.")

        today = date.today()
        if (year, month) > (today.year, today.month):
            raise HTTPException(
                status_code=400,
                detail=f"Cannot run payroll for a future month ({year}-{month:02d}).",
            )

        emp = (await db.execute(select(Employee).where(Employee.id == employee_id))).scalar_one_or_none()
        if emp is None:
            raise NotFoundException("Employee not found.")
        if emp.base_salary is None:
            raise HTTPException(status_code=400, detail="Employee has no base_salary (gross) set.")

        # Çalışan henüz işe başlamadıysa (gelecek tarihli hire_date) çalıştırılamaz.
        if emp.hire_date and (emp.hire_date.year, emp.hire_date.month) > (year, month):
            raise HTTPException(status_code=400,
                detail="Çalışan bu dönemde henüz işe başlamamış (işe giriş tarihi ileride).")

        chain_start = _chain_start_month(emp.hire_date, year)
        if month < chain_start:
            raise HTTPException(status_code=400,
                detail=f"Month {month} is before the employee's first payroll month ({chain_start}).")

        existing_rows = (await db.execute(
            select(Payslip.month).where(
                Payslip.employee_id == employee_id,
                Payslip.year == year,
            )
        )).scalars().all()
        have = set(existing_rows)

        # Run every month from chain_start..month that is missing, in order.
        for m in range(chain_start, month + 1):
            if m not in have:
                await self.run_month(db, employee_id, year, m)

        return await self.get_year(db, employee_id, year)

    async def _require_prev(self, db, employee_id, year, month, chain_start):
        """Ensure every month from chain_start..month-1 exists; return the (month-1) payslip."""
        rows = (await db.execute(
            select(Payslip.month).where(
                Payslip.employee_id == employee_id,
                Payslip.year == year,
                Payslip.month >= chain_start,
                Payslip.month < month,
            )
        )).scalars().all()
        have = set(rows)
        need = set(range(chain_start, month))
        missing = sorted(need - have)
        if missing:
            raise HTTPException(status_code=400,
                detail=f"Missing prior months {missing}. Run them first (strict chain).")
        prev = await _prior_payslip(db, employee_id, year, month)
        return prev

    async def get_year(self, db: AsyncSession, employee_id: str, year: int) -> list[Payslip]:
        """All stored payslips for an employee in a year, ordered by month."""
        return list((await db.execute(
            select(Payslip).where(
                Payslip.employee_id == employee_id,
                Payslip.year == year,
            ).order_by(Payslip.month)
        )).scalars().all())


payroll_service = PayrollService()

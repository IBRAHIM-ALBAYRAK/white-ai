"""
app/modules/payroll/models.py

Payroll parameter tables — date-versioned statutory inputs for the payroll engine.
When the law changes, add a NEW row (effective_from/effective_to) instead of
touching code. The engine always queries "the row valid on date X".

V1 SCOPE: monthly-salaried, full-time, full 30-day month.
NOTE: statutory figures from public sources; MUST be verified by a mali müşavir
before going live.
"""

import uuid
from datetime import datetime, timezone, date
from sqlalchemy import String, Date, DateTime, Numeric, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class MinimumWage(Base):
    """Date-versioned minimum wage. One row per effective period."""
    __tablename__ = "payroll_minimum_wage"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    period_code: Mapped[str] = mapped_column(String(20), nullable=False)
    gross_monthly: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    net_monthly: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    gross_daily: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    effective_from: Mapped[date] = mapped_column(Date, nullable=False)
    effective_to: Mapped[date] = mapped_column(Date, nullable=True)
    note: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class PayrollRate(Base):
    """
    Date-versioned scalar rates & limits as key/value, so new parameters need no
    schema change. 2026 examples: sgk_isci=0.14, issizlik_isci=0.01,
    sgk_isveren=0.2175, issizlik_isveren=0.02, damga=0.00759, sgk_tavan=297270.
    """
    __tablename__ = "payroll_rates"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    rate_key: Mapped[str] = mapped_column(String(50), nullable=False)
    rate_value: Mapped[float] = mapped_column(Numeric(14, 6), nullable=False)
    effective_from: Mapped[date] = mapped_column(Date, nullable=False)
    effective_to: Mapped[date] = mapped_column(Date, nullable=True)
    note: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class IncomeTaxBracket(Base):
    """
    Date-versioned progressive income-tax brackets for WAGE earners (GVK Md. 103),
    on the CUMULATIVE tax base. Marginal tax =
    fixed_amount + (cumulative_base - cumulative_min) * rate.
    """
    __tablename__ = "payroll_income_tax_brackets"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    bracket_order: Mapped[int] = mapped_column(Integer, nullable=False)
    cumulative_min: Mapped[float] = mapped_column(Numeric(16, 2), nullable=False)
    cumulative_max: Mapped[float] = mapped_column(Numeric(16, 2), nullable=True)
    rate: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False)
    fixed_amount: Mapped[float] = mapped_column(Numeric(16, 2), nullable=False)
    effective_from: Mapped[date] = mapped_column(Date, nullable=False)
    effective_to: Mapped[date] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))



class Payslip(Base):
    """
    A computed-and-stored monthly payslip for one employee.
    The cumulative bases are snapshotted so the next month reads them directly
    (no simulation). One row per (employee_id, year, month) — enforced unique.
    Re-running a month UPDATES the existing row (correction).
    """
    __tablename__ = "payslips"
    __table_args__ = (UniqueConstraint("employee_id", "year", "month", name="uq_payslip_emp_period"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    employee_id: Mapped[str] = mapped_column(String, ForeignKey("employees.id"), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    month: Mapped[int] = mapped_column(Integer, nullable=False)        # 1..12
    sgk_days: Mapped[int] = mapped_column(Integer, nullable=False)

    # Inputs snapshot
    full_monthly_gross: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    gross: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)  # prorated paid gross

    # Employee deductions
    sgk_base: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    sgk_employee: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    unemployment_employee: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    income_tax_base: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    cumulative_base_before: Mapped[float] = mapped_column(Numeric(16, 2), nullable=False)
    cumulative_base_after: Mapped[float] = mapped_column(Numeric(16, 2), nullable=False)
    income_tax_gross: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    income_tax_exemption: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    income_tax_net: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    stamp_tax_gross: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    stamp_tax_exemption: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    stamp_tax_net: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    net_salary: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)

    # Employer cost
    sgk_employer: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    unemployment_employer: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    employer_cost: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)

    # Min-wage cumulative snapshot (drives next month's exemption climb)
    mw_cumulative_base_after: Mapped[float] = mapped_column(Numeric(16, 2), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
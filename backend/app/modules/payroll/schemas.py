"""app/modules/payroll/schemas.py — request/response shapes for payroll."""
from pydantic import BaseModel
from datetime import datetime


class RunMonthSchema(BaseModel):
    """Body for POST /payroll/run — calculate & store one month."""
    employee_id: str
    year: int
    month: int   # 1..12


class PayslipResponseSchema(BaseModel):
    id: str
    employee_id: str
    year: int
    month: int
    sgk_days: int
    full_monthly_gross: float
    gross: float
    sgk_base: float
    sgk_employee: float
    unemployment_employee: float
    income_tax_base: float
    cumulative_base_before: float
    cumulative_base_after: float
    income_tax_gross: float
    income_tax_exemption: float
    income_tax_net: float
    stamp_tax_gross: float
    stamp_tax_exemption: float
    stamp_tax_net: float
    net_salary: float
    sgk_employer: float
    unemployment_employer: float
    employer_cost: float
    mw_cumulative_base_after: float
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

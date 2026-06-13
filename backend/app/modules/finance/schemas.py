"""
app/modules/finance/schemas.py
Pydantic schemas for the Finance ledger.
"""
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel


# ── Category ──
class FinanceCategoryCreateSchema(BaseModel):
    name: str
    kind: str  # "income" | "expense"


class FinanceCategoryResponseSchema(BaseModel):
    id: str
    company_id: str
    name: str
    kind: str
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}


# ── Entry ──
class FinanceEntryCreateSchema(BaseModel):
    category_id: str
    amount: float
    entry_date: Optional[date] = None
    branch_id: Optional[str] = None
    note: Optional[str] = None


class FinanceEntryUpdateSchema(BaseModel):
    admin_password: str
    category_id: Optional[str] = None
    amount: Optional[float] = None
    entry_date: Optional[date] = None
    branch_id: Optional[str] = None
    note: Optional[str] = None


class FinanceEntryDeleteSchema(BaseModel):
    admin_password: str


class FinanceEntryResponseSchema(BaseModel):
    id: str
    company_id: str
    category_id: str
    category_name: Optional[str] = None
    kind: str
    amount: float
    entry_date: date
    branch_id: Optional[str] = None
    note: Optional[str] = None
    created_at: datetime
    is_deleted: bool = False
    model_config = {"from_attributes": True}


# ── Audit log ──
class FinanceAuditLogResponseSchema(BaseModel):
    id: str
    action: str               # created | updated | deleted
    kind: Optional[str] = None
    amount: Optional[float] = None
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    actor_name: Optional[str] = None
    created_at: datetime
    model_config = {"from_attributes": True}


# ── Overview ──
class CategorySumSchema(BaseModel):
    category_id: str
    name: str
    kind: str
    total: float


class FinanceOverviewSchema(BaseModel):
    year: int
    month: int
    shipment_income: float
    franchise_shipment_income: float
    payroll_cost: float
    warehouse_value: float
    active_franchise_count: int
    manual_income: float
    manual_expense: float
    income_categories: List[CategorySumSchema]
    expense_categories: List[CategorySumSchema]
    total_income: float
    total_expense: float
    net: float

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
    category_id: Optional[str] = None
    amount: Optional[float] = None
    entry_date: Optional[date] = None
    branch_id: Optional[str] = None
    note: Optional[str] = None


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
    model_config = {"from_attributes": True}


# ── Overview (Finans Genel Bakis besler) ──
class CategorySumSchema(BaseModel):
    category_id: str
    name: str
    kind: str
    total: float


class FinanceOverviewSchema(BaseModel):
    year: int
    month: int
    # otomatik kalemler (sistemden)
    shipment_income: float          # subelere sevkiyat geliri (stock_transfers)
    franchise_shipment_income: float  # sadece franchise'a sevk
    payroll_cost: float             # bordro employer_cost toplam
    warehouse_value: float          # depo stok degeri
    active_franchise_count: int
    # manuel defter (finance_entries)
    manual_income: float
    manual_expense: float
    income_categories: List[CategorySumSchema]
    expense_categories: List[CategorySumSchema]
    # toplamlar
    total_income: float
    total_expense: float
    net: float

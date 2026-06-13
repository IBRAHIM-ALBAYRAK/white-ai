"""
app/modules/finance/models.py
Database models for the brand-owner Finance ledger (Gelir / Gider).
Tables:
  - finance_categories : Income/expense headings defined by the brand
                         (e.g. "Reklam", "Kira", "Royalty"). Brand-level
                         (company_id), so all branches share one consistent set.
  - finance_entries    : Individual money movements, each tied to a category
                         and optionally a branch (branch_id NULL = brand-wide).
Above-store / in-store model (Fourth-style):
  - Brand owner defines categories + records entries for any branch / brand-wide.
  - A branch manager (future panel) may only pick from brand categories and
    record entries for their own branch — never create categories.
"""
import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Float, Boolean, DateTime, Date, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class FinanceKind(str, enum.Enum):
    income = "income"
    expense = "expense"


class FinanceCategory(Base):
    __tablename__ = "finance_categories"
    id         = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String, ForeignKey("companies.id"), nullable=False)
    name       = Column(String, nullable=False)
    kind       = Column(SAEnum(FinanceKind), nullable=False)
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    entries    = relationship("FinanceEntry", back_populates="category", lazy="select")


class FinanceEntry(Base):
    __tablename__ = "finance_entries"
    id          = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id  = Column(String, ForeignKey("companies.id"), nullable=False)
    category_id = Column(String, ForeignKey("finance_categories.id"), nullable=False)
    kind        = Column(SAEnum(FinanceKind), nullable=False)
    amount      = Column(Float, nullable=False)
    entry_date  = Column(Date, nullable=False, default=lambda: date.today())
    branch_id   = Column(String, ForeignKey("branches.id"), nullable=True)  # NULL = marka geneli
    note        = Column(String, nullable=True)
    created_by  = Column(String, ForeignKey("users.id"), nullable=True)
    created_at  = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    category    = relationship("FinanceCategory", back_populates="entries", lazy="select")

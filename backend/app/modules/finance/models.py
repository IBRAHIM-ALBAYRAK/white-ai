"""
app/modules/finance/models.py
Database models for the brand-owner Finance ledger (Gelir / Gider).
Tables:
  - finance_categories : Income/expense headings defined by the brand
                         (e.g. "Reklam", "Kira", "Royalty"). Brand-level
                         (company_id), so all branches share one consistent set.
  - finance_entries    : Individual money movements, each tied to a category
                         and optionally a branch (branch_id NULL = brand-wide).
                         Soft-deletable (is_deleted) — finance records are never
                         hard-deleted; they are archived for audit.
  - finance_audit_log  : Append-only trail of every action (created / updated /
                         deleted) on entries — who, when, old vs new value.
Above-store / in-store model (Fourth-style):
  - Brand owner defines categories + records entries for any branch / brand-wide.
  - A branch manager (future panel) may only pick from brand categories and
    record entries for their own branch — never create categories.
"""
import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Float, Boolean, DateTime, Date, ForeignKey, Enum as SAEnum, Text
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
    # soft delete (denetim icin asla hard-delete yok)
    is_deleted  = Column(Boolean, default=False, nullable=False)
    deleted_at  = Column(DateTime(timezone=True), nullable=True)
    deleted_by  = Column(String, ForeignKey("users.id"), nullable=True)
    updated_at  = Column(DateTime(timezone=True), nullable=True)
    category    = relationship("FinanceCategory", back_populates="entries", lazy="select")


class FinanceAuditAction(str, enum.Enum):
    created = "created"
    updated = "updated"
    deleted = "deleted"


class FinanceAuditLog(Base):
    """
    Append-only trail. One row per action on a finance entry.
    old_value / new_value are short human-readable summaries
    (e.g. "Reklam · 3.000,00 · Marka geneli").
    """
    __tablename__ = "finance_audit_log"
    id         = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id = Column(String, ForeignKey("companies.id"), nullable=False)
    entry_id   = Column(String, ForeignKey("finance_entries.id"), nullable=True)
    action     = Column(SAEnum(FinanceAuditAction), nullable=False)
    kind       = Column(SAEnum(FinanceKind), nullable=True)
    category_name = Column(String, nullable=True)
    amount     = Column(Float, nullable=True)
    old_value  = Column(Text, nullable=True)
    new_value  = Column(Text, nullable=True)
    actor_id   = Column(String, ForeignKey("users.id"), nullable=True)
    actor_name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

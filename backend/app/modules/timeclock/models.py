"""
app/modules/timeclock/models.py

Database models for Time Clock module.

Tables:
  - timeclock_records: Every check-in and check-out event per employee per shift.
    A record starts open (checked_in, no check-out time).
    On check-out, checked_out_at and total_minutes are populated.
    Status transitions: open → completed | open → missing_checkout (if never closed).
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class RecordStatus(str, enum.Enum):
    OPEN             = "open"              # Checked in, not yet checked out
    COMPLETED        = "completed"         # Normal check-in + check-out
    MISSING_CHECKOUT = "missing_checkout"  # Never checked out — flagged by manager
    ADJUSTED         = "adjusted"          # Manually corrected by manager


class TimeRecord(Base):
    __tablename__ = "timeclock_records"

    id               = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    branch_id        = Column(String, ForeignKey("branches.id"), nullable=False)
    employee_id = Column(String, ForeignKey("employees.id"), nullable=False)
    checked_in_at    = Column(DateTime(timezone=True), nullable=False)
    checked_out_at   = Column(DateTime(timezone=True), nullable=True)
    total_minutes    = Column(Integer, nullable=True)       # Populated on check-out
    status           = Column(SAEnum(RecordStatus), default=RecordStatus.OPEN, nullable=False)
    notes            = Column(String, nullable=True)        # Manager notes on adjustment
    is_late          = Column(Boolean, default=False)       # Flagged if check-in is late
    created_at       = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at       = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
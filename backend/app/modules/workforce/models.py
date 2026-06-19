"""
app/modules/workforce/models.py

Defines the Shift and ShiftAssignment database tables.

Shift: a time block created by a manager for a specific branch.
  Example: "Saturday 09:00-17:00, Georgia Kadıköy Branch"

ShiftAssignment: links a specific employee to a shift.
  A shift can have multiple employees assigned to it.
  Each assignment tracks whether the employee confirmed or rejected.

Weekly overtime is tracked in the service layer — if an employee
exceeds 45 hours in a week, the system raises an OvertimeException.
"""

import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, ForeignKey, Enum as SAEnum, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class ShiftStatus(str, enum.Enum):
    DRAFT = "draft"           # Created but not published to employees
    PUBLISHED = "published"   # Visible to employees
    CANCELLED = "cancelled"   # Cancelled by manager


class AssignmentStatus(str, enum.Enum):
    ASSIGNED = "assigned"     # Employee has been assigned
    CONFIRMED = "confirmed"   # Employee confirmed the shift
    REJECTED = "rejected"     # Employee rejected the shift


class Shift(Base):
    __tablename__ = "shifts"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    branch_id: Mapped[str] = mapped_column(String, ForeignKey("branches.id"), nullable=False)
    created_by: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[ShiftStatus] = mapped_column(SAEnum(ShiftStatus), default=ShiftStatus.DRAFT, nullable=False)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    assignments: Mapped[list["ShiftAssignment"]] = relationship("ShiftAssignment", back_populates="shift")


class ShiftAssignment(Base):
    __tablename__ = "shift_assignments"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    shift_id: Mapped[str] = mapped_column(String, ForeignKey("shifts.id"), nullable=False)
    employee_id: Mapped[str] = mapped_column(String, ForeignKey("employees.id"), nullable=False)
    status: Mapped[AssignmentStatus] = mapped_column(SAEnum(AssignmentStatus), default=AssignmentStatus.ASSIGNED, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    shift: Mapped["Shift"] = relationship("Shift", back_populates="assignments")


class ShiftTemplate(Base):
    """Manager-defined reusable shift type (e.g. 'Sabah 08:00-16:00').
    Branch-scoped; each branch maintains its own set of templates."""
    __tablename__ = "shift_templates"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    branch_id: Mapped[str] = mapped_column(String, ForeignKey("branches.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    start_label: Mapped[str] = mapped_column(String(5), nullable=False)   # "08:00"
    end_label: Mapped[str] = mapped_column(String(5), nullable=False)     # "16:00"
    color: Mapped[str] = mapped_column(String(20), nullable=False, default="green")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

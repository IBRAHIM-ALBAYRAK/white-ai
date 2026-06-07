"""
app/modules/employee_portal/leaves/models.py

================================================================================
LEAVE MANAGEMENT MODEL — Employee Portal
================================================================================

WHAT THIS FILE DOES:
    Defines the database model for employee leave requests (annual leave, sick
    leave, unpaid leave, etc). This is part of the Employee Self-Service Portal,
    where employees can submit leave requests that managers approve or reject.

WHERE IT LIVES:
    app/modules/employee_portal/
        ├── leaves/          ← YOU ARE HERE (leave requests)
        ├── announcements/   (company/branch news feed)
        ├── documents/       (employee document center — contracts, payslips)
        └── shift_swaps/     (shift exchange requests between employees)

    The employee_portal package groups all features that employees (not admins)
    interact with through their own dedicated panel. Admins manage these from the
    admin panel; employees create/view them from the employee panel.

REQUEST LIFECYCLE (state machine):
    1. Employee submits a request          → status = PENDING
    2a. Manager approves                   → status = APPROVED
    2b. Manager rejects (with reason)      → status = REJECTED
    3. Employee cancels own pending request → status = CANCELLED

    Once a request is APPROVED or REJECTED, it is locked (manager decision final).
    Only PENDING requests can be cancelled by the employee.

DATA RETENTION:
    Leave records are NEVER hard-deleted. They are permanent historical records
    needed for labor law compliance, annual leave balance tracking, and audit
    trails. Status changes only — the row stays forever.

KEY RELATIONSHIPS:
    employee_id  → employees.id  (who is requesting the leave)
    company_id   → companies.id  (denormalized for fast company-wide queries)
    branch_id    → branches.id   (denormalized for branch-level filtering)
    reviewed_by  → users.id      (which manager/admin made the decision)

    Note: employee_id points to employees.id (NOT users.id), consistent with the
    rest of the system since the User↔Employee split. The reviewer is a User
    because approvals are done by people with system login access (managers).
================================================================================
"""

import uuid
import enum
from datetime import datetime, timezone, date
from sqlalchemy import (
    Column, String, Integer, DateTime, Date,
    ForeignKey, Text, Enum as SAEnum
)
from app.core.database import Base


class LeaveType(str, enum.Enum):
    """
    Categories of leave, aligned with Turkish labor law (İş Kanunu) leave types.
    Used for reporting and for distinguishing paid vs unpaid leave in payroll.
    """
    ANNUAL    = "annual"      # Yıllık ücretli izin — paid annual leave
    SICK      = "sick"        # Hastalık izni / raporlu — sick leave (medical report)
    UNPAID    = "unpaid"      # Ücretsiz izin — unpaid leave
    MATERNITY = "maternity"   # Doğum / analık izni — maternity leave
    EXCUSE    = "excuse"      # Mazeret izni — excuse leave (marriage, bereavement, etc.)
    OTHER     = "other"       # Anything not covered above


class LeaveStatus(str, enum.Enum):
    """
    The lifecycle state of a leave request. See REQUEST LIFECYCLE above.
    Transitions are enforced in the service layer, not here.
    """
    PENDING   = "pending"     # Submitted, awaiting manager decision
    APPROVED  = "approved"    # Manager approved — leave is confirmed
    REJECTED  = "rejected"    # Manager rejected — see review_note for reason
    CANCELLED = "cancelled"   # Employee withdrew their own pending request


class LeaveRequest(Base):
    """
    A single leave request submitted by an employee.

    One employee can have many leave requests over time. Each request covers a
    continuous date range (start_date → end_date). For non-continuous leave, the
    employee submits multiple separate requests.
    """
    __tablename__ = "leave_requests"

    id            = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # --- Relationships (who & where) ---
    employee_id   = Column(String, ForeignKey("employees.id"), nullable=False)   # Requester
    company_id    = Column(String, ForeignKey("companies.id"), nullable=False)   # Denormalized
    branch_id     = Column(String, ForeignKey("branches.id"), nullable=True)     # Denormalized

    # --- Request details ---
    leave_type    = Column(SAEnum(LeaveType), default=LeaveType.ANNUAL, nullable=False)
    start_date    = Column(Date, nullable=False)           # First day of leave
    end_date      = Column(Date, nullable=False)           # Last day of leave (inclusive)
    days_count    = Column(Integer, nullable=False)        # Total leave days (computed in service)
    reason        = Column(Text, nullable=True)            # Employee's explanation / note

    # --- Status (state machine) ---
    status        = Column(SAEnum(LeaveStatus), default=LeaveStatus.PENDING, nullable=False)

    # --- Review / approval info ---
    reviewed_by   = Column(String, ForeignKey("users.id"), nullable=True)  # Manager who decided
    reviewed_at   = Column(DateTime(timezone=True), nullable=True)         # When decided
    review_note   = Column(Text, nullable=True)            # Manager's note (e.g. rejection reason)

    # --- Timestamps ---
    created_at    = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at    = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
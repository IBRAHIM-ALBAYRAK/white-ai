"""
app/modules/employee_portal/shift_swaps/models.py

================================================================================
SHIFT SWAP MODEL — Employee Portal
================================================================================

WHAT THIS FILE DOES:
    Defines the database model for shift swap requests — when an employee wants
    to give away or exchange a shift with a coworker. This is one of the most
    valued features in Deputy/HotSchedules: it lets staff self-organize coverage
    without the manager having to redo the whole schedule.

WHERE IT LIVES:
    app/modules/employee_portal/
        ├── leaves/          (leave requests — DONE)
        ├── announcements/   (news feed — DONE)
        ├── documents/       (document center — DONE)
        └── shift_swaps/     ← YOU ARE HERE (shift exchange requests)

THE SWAP FLOW (two-stage approval):
    A swap needs agreement from BOTH the coworker AND the manager:

    1. Requester picks a shift to give away and (optionally) a target coworker
                                                    → status = PENDING
    2a. Target coworker accepts                     → status = ACCEPTED
    2b. Target coworker declines                    → status = DECLINED (ends here)
    3a. Manager approves the accepted swap          → status = APPROVED (swap happens)
    3b. Manager rejects                             → status = REJECTED (ends here)
    4. Requester cancels before completion          → status = CANCELLED

    Why two stages? The coworker must agree to take the shift (you can't dump a
    shift on someone), AND the manager must confirm coverage rules are still met
    (skills, overtime, headcount). Both gates protect the schedule.

LINK TO REAL SHIFTS:
    original_shift_id points at the workforce module's shifts table — the shift
    being given away. (When the workforce module gains per-employee shift
    assignments, this will tie directly into who is actually scheduled. For now
    it references the shift row so the structure is ready.)

KEY RELATIONSHIPS:
    requester_id      → employees.id  (who wants to give away their shift)
    target_id         → employees.id  (coworker asked to take it; nullable = open offer)
    original_shift_id → shifts.id     (the shift being swapped away)
    manager_id        → users.id      (manager who approves/rejects; set on decision)

    requester/target are Employees (staff). manager is a User (login access).
    target_id is nullable to support "open" swaps offered to the whole team
    rather than one named coworker.
================================================================================
"""

import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, DateTime, Text,
    ForeignKey, Enum as SAEnum
)
from app.core.database import Base


class SwapStatus(str, enum.Enum):
    """
    The lifecycle state of a shift swap request. See THE SWAP FLOW above.
    Two-stage: coworker acceptance, then manager approval.
    """
    PENDING   = "pending"     # Waiting for the target coworker to accept
    ACCEPTED  = "accepted"    # Coworker accepted; now waiting for manager
    DECLINED  = "declined"    # Coworker declined — request ends
    APPROVED  = "approved"    # Manager approved — the swap is finalized
    REJECTED  = "rejected"    # Manager rejected — request ends
    CANCELLED = "cancelled"   # Requester withdrew before completion


class ShiftSwapRequest(Base):
    """
    A single shift swap request between employees, gated by manager approval.

    One employee can open many swap requests. Each references the shift being
    given away and (optionally) the coworker being asked to take it.
    """
    __tablename__ = "shift_swap_requests"

    id                = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # --- Parties involved ---
    requester_id      = Column(String, ForeignKey("employees.id"), nullable=False)  # Gives away
    target_id         = Column(String, ForeignKey("employees.id"), nullable=True)   # Takes it (null = open)

    # --- Org context (denormalized for fast filtering) ---
    company_id        = Column(String, ForeignKey("companies.id"), nullable=False)
    branch_id         = Column(String, ForeignKey("branches.id"), nullable=True)

    # --- The shift being swapped ---
    original_shift_id = Column(String, ForeignKey("shifts.id"), nullable=False)

    # --- Request details ---
    reason            = Column(Text, nullable=True)        # Why the requester needs the swap

    # --- Status (two-stage state machine) ---
    status            = Column(SAEnum(SwapStatus), default=SwapStatus.PENDING, nullable=False)

    # --- Coworker response ---
    responded_at      = Column(DateTime(timezone=True), nullable=True)  # When target accepted/declined

    # --- Manager decision ---
    manager_id        = Column(String, ForeignKey("users.id"), nullable=True)       # Who decided
    manager_decided_at = Column(DateTime(timezone=True), nullable=True)
    manager_note      = Column(Text, nullable=True)        # Rejection reason / note

    # --- Timestamps ---
    created_at        = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at        = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
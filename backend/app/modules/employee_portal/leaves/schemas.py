"""
app/modules/employee_portal/leaves/schemas.py

================================================================================
LEAVE MANAGEMENT — Pydantic Schemas
================================================================================

WHAT THIS FILE DOES:
    Defines the request/response data shapes (Pydantic models) for the leave
    management API. These validate incoming JSON from the frontend and serialize
    outgoing database rows back to JSON.

    Think of schemas as the "contract" between frontend and backend: they decide
    which fields the client can send and which fields the API returns.

WHERE IT LIVES:
    app/modules/employee_portal/leaves/schemas.py
    Sits between the router (HTTP layer) and the service (business logic).

SCHEMA OVERVIEW:
    LeaveCreateSchema   → employee submits a new request (what they can send)
    LeaveReviewSchema   → manager approves/rejects (decision + optional note)
    LeaveResponseSchema → what the API returns for any leave request

DESIGN NOTES:
    - days_count is NOT in the create schema. It is computed by the service from
      start_date/end_date so the client can't fake it.
    - status is NOT settable on create — every new request starts as PENDING,
      enforced by the model default and the service.
    - The employee only sends leave details; company_id/branch_id are resolved
      server-side from the authenticated employee's profile (never trusted from
      the client).
================================================================================
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from app.modules.employee_portal.leaves.models import LeaveType, LeaveStatus


# --- Create (employee submits a request) ---

class LeaveCreateSchema(BaseModel):
    """
    Payload an employee sends to create a new leave request.
    company_id / branch_id are resolved server-side, NOT sent by the client.
    days_count is computed server-side from the date range.
    """
    employee_id: str                       # Which employee (resolved/verified server-side)
    leave_type: LeaveType = LeaveType.ANNUAL
    start_date: date                       # First day of leave
    end_date: date                         # Last day of leave (inclusive)
    reason: Optional[str] = None           # Employee's explanation


# --- Review (manager approves or rejects) ---

class LeaveReviewSchema(BaseModel):
    """
    Payload a manager sends to approve or reject a pending request.
    `approve=True` → APPROVED, `approve=False` → REJECTED.
    review_note is optional but recommended for rejections.
    """
    approve: bool                          # True = approve, False = reject
    review_note: Optional[str] = None      # Manager's note / rejection reason


# --- Response (what the API returns) ---

class LeaveResponseSchema(BaseModel):
    """
    Full representation of a leave request returned by the API.
    Includes computed and review fields so the frontend can render everything.
    """
    id: str
    employee_id: str
    company_id: str
    branch_id: Optional[str]
    leave_type: LeaveType
    start_date: date
    end_date: date
    days_count: int
    reason: Optional[str]
    status: LeaveStatus
    reviewed_by: Optional[str]
    reviewed_at: Optional[datetime]
    review_note: Optional[str]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}
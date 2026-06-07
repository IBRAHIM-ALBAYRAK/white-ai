"""
app/modules/employee_portal/shift_swaps/schemas.py

================================================================================
SHIFT SWAP — Pydantic Schemas
================================================================================

WHAT THIS FILE DOES:
    Defines the request/response shapes for the shift swap API. Covers the three
    actions in the two-stage flow: creating a swap, the coworker responding, and
    the manager deciding.

WHERE IT LIVES:
    app/modules/employee_portal/shift_swaps/schemas.py
    Sits between shift_swaps/router.py (HTTP) and shift_swaps/service.py (logic).

SCHEMA OVERVIEW:
    SwapCreateSchema    → requester opens a swap (which shift, optional target)
    SwapRespondSchema   → target coworker accepts or declines
    SwapDecideSchema    → manager approves or rejects (final gate)
    SwapResponseSchema  → what the API returns for any swap request

DESIGN NOTES:
    - company_id / branch_id are resolved server-side from the requester's
      employee profile — not trusted from the client.
    - status is never settable directly by the client. It moves only through the
      three action schemas, enforced by the service's state machine.
    - target_id is optional on create: null = an "open" swap offered to the whole
      team; set = a swap offered to one named coworker.
    - manager_id / responded_at / decided_at are all stamped server-side.
================================================================================
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.modules.employee_portal.shift_swaps.models import SwapStatus


# --- Create (requester opens a swap) ---

class SwapCreateSchema(BaseModel):
    """
    Payload to open a new shift swap request.
    company_id / branch_id are resolved server-side from the requester.
    """
    requester_id: str                      # Employee giving away the shift
    original_shift_id: str                 # The shift being swapped away
    target_id: Optional[str] = None        # Coworker asked to take it (null = open offer)
    reason: Optional[str] = None           # Why the swap is needed


# --- Respond (target coworker accepts / declines) ---

class SwapRespondSchema(BaseModel):
    """
    Payload the target coworker sends to accept or decline a pending swap.
    `accept=True` → ACCEPTED (moves to manager), `accept=False` → DECLINED (ends).
    """
    target_id: str                         # The coworker responding (ownership check)
    accept: bool                           # True = accept, False = decline


# --- Decide (manager approves / rejects) ---

class SwapDecideSchema(BaseModel):
    """
    Payload the manager sends to finalize an accepted swap.
    `approve=True` → APPROVED (swap happens), `approve=False` → REJECTED.
    """
    approve: bool                          # True = approve, False = reject
    manager_note: Optional[str] = None     # Note / rejection reason


# --- Response (what the API returns) ---

class SwapResponseSchema(BaseModel):
    """Full representation of a shift swap request returned by the API."""
    id: str
    requester_id: str
    target_id: Optional[str]
    company_id: str
    branch_id: Optional[str]
    original_shift_id: str
    reason: Optional[str]
    status: SwapStatus
    responded_at: Optional[datetime]
    manager_id: Optional[str]
    manager_decided_at: Optional[datetime]
    manager_note: Optional[str]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}
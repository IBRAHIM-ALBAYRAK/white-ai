"""
app/modules/employee_portal/shift_swaps/router.py

================================================================================
SHIFT SWAP — API Router (HTTP Layer)
================================================================================

WHAT THIS FILE DOES:
    Exposes the shift swap endpoints over HTTP. Thin layer: authenticates, parses
    input, delegates to shift_swap_service. The two-stage approval flow is driven
    by three action endpoints (respond, decide) plus create/cancel.

WHERE IT LIVES:
    app/modules/employee_portal/shift_swaps/router.py
    Registered in app/main.py under the /api/v1 prefix.

ENDPOINTS:
    POST   /api/v1/shift-swaps                     → requester opens a swap
    GET    /api/v1/shift-swaps/employee/{id}        → swaps I requested or was targeted for
    GET    /api/v1/shift-swaps/branch/{id}          → all swaps in a branch (manager)
    GET    /api/v1/shift-swaps/branch/{id}/pending  → manager approval queue (ACCEPTED)
    GET    /api/v1/shift-swaps/{id}                 → single swap
    PUT    /api/v1/shift-swaps/{id}/respond         → coworker accepts/declines (stage 1)
    PUT    /api/v1/shift-swaps/{id}/decide          → manager approves/rejects (stage 2)
    PUT    /api/v1/shift-swaps/{id}/cancel          → requester withdraws

AUTH:
    All endpoints require a valid Bearer token. On manager decide, the manager's
    user id (token "sub") is stamped as manager_id. Ownership checks (target on
    respond, requester on cancel) are enforced in the service via IDs in the body.
================================================================================
"""

from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedException
from app.modules.employee_portal.shift_swaps.schemas import (
    SwapCreateSchema,
    SwapRespondSchema,
    SwapDecideSchema,
    SwapResponseSchema,
)
from app.modules.employee_portal.shift_swaps.service import shift_swap_service

router = APIRouter(prefix="/shift-swaps", tags=["Shift Swaps"])
security = HTTPBearer()


class CancelSwapSchema(BaseModel):
    """Body for cancel — the requester_id of the owner withdrawing the swap."""
    requester_id: str


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Decode and validate the Bearer token; return the token payload."""
    payload = decode_token(credentials.credentials)
    if not payload:
        raise UnauthorizedException("Invalid or expired token.")
    return payload


# --- Create (requester) ---

@router.post("", response_model=SwapResponseSchema)
async def create_swap(
    data: SwapCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Requester opens a new shift swap request."""
    return await shift_swap_service.create_swap(db, data)


# --- Read ---

@router.get("/employee/{employee_id}", response_model=list[SwapResponseSchema])
async def list_by_employee(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Swaps where the employee is requester or target ('My Swaps' view)."""
    return await shift_swap_service.get_by_employee(db, employee_id)


@router.get("/branch/{branch_id}", response_model=list[SwapResponseSchema])
async def list_by_branch(
    branch_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """All swaps in a branch (manager's full view)."""
    return await shift_swap_service.get_by_branch(db, branch_id)


@router.get("/branch/{branch_id}/pending", response_model=list[SwapResponseSchema])
async def list_pending_approval(
    branch_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Manager approval queue: ACCEPTED swaps awaiting the manager's decision."""
    return await shift_swap_service.get_pending_manager_approval(db, branch_id)


@router.get("/{swap_id}", response_model=SwapResponseSchema)
async def get_swap(
    swap_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get a single swap request by ID."""
    return await shift_swap_service.get_swap(db, swap_id)


# --- Respond (coworker, stage 1) ---

@router.put("/{swap_id}/respond", response_model=SwapResponseSchema)
async def respond_swap(
    swap_id: str,
    data: SwapRespondSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Target coworker accepts or declines a pending swap (stage 1)."""
    return await shift_swap_service.respond_swap(db, swap_id, data)


# --- Decide (manager, stage 2) ---

@router.put("/{swap_id}/decide", response_model=SwapResponseSchema)
async def decide_swap(
    swap_id: str,
    data: SwapDecideSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Manager approves or rejects an accepted swap (stage 2, final)."""
    return await shift_swap_service.decide_swap(
        db, swap_id=swap_id, manager_id=current_user["sub"], data=data
    )


# --- Cancel (requester) ---

@router.put("/{swap_id}/cancel", response_model=SwapResponseSchema)
async def cancel_swap(
    swap_id: str,
    data: CancelSwapSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Requester withdraws their own swap (while pending or accepted)."""
    return await shift_swap_service.cancel_swap(
        db, swap_id=swap_id, requester_id=data.requester_id
    )
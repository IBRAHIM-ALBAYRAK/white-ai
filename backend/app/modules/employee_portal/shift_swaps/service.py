"""
app/modules/employee_portal/shift_swaps/service.py

================================================================================
SHIFT SWAP — Business Logic (Service Layer)
================================================================================

WHAT THIS FILE DOES:
    Business rules for shift swaps, including the two-stage state machine
    (coworker acceptance → manager approval). This is the most stateful module in
    the employee portal, so the transition rules live here and are strictly
    enforced.

WHERE IT LIVES:
    app/modules/employee_portal/shift_swaps/service.py
    Called by shift_swaps/router.py. Talks to the ShiftSwapRequest model and
    reads the Employee model to resolve company/branch.

THE STATE MACHINE (enforced here):
    create   : (none)     → PENDING
    respond  : PENDING    → ACCEPTED  (coworker accepts)
               PENDING    → DECLINED  (coworker declines, terminal)
    decide   : ACCEPTED   → APPROVED  (manager approves, terminal)
               ACCEPTED   → REJECTED  (manager rejects, terminal)
    cancel   : PENDING    → CANCELLED (requester withdraws)
               ACCEPTED   → CANCELLED (requester withdraws before manager decides)

    Any transition not listed above is rejected with a clear error. Terminal
    states (DECLINED/APPROVED/REJECTED/CANCELLED) cannot change.

OWNERSHIP CHECKS:
    - respond: only the named target coworker can accept/decline.
    - cancel : only the original requester can cancel.
    - decide : any authenticated manager (role hardening comes later).

DESIGN NOTES:
    - company_id / branch_id are copied from the requester's employee profile so
      the swap is correctly scoped without trusting client input.
    - This service does NOT yet mutate the actual schedule (reassign the shift on
      approval). That wiring happens when the workforce module gains per-employee
      shift assignments. For now APPROVED records the decision; the schedule
      reassignment is a follow-up step.
================================================================================
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.modules.employee_portal.shift_swaps.models import (
    ShiftSwapRequest, SwapStatus
)
from app.modules.employee_portal.shift_swaps.schemas import (
    SwapCreateSchema, SwapRespondSchema, SwapDecideSchema
)
from app.modules.employees.models import Employee
from app.core.exceptions import BadRequestException, NotFoundException


class ShiftSwapService:

    # ── Create ───────────────────────────────────────────────────────────────

    async def create_swap(self, db: AsyncSession, data: SwapCreateSchema) -> ShiftSwapRequest:
        """
        Open a new shift swap request.
        Resolves company/branch from the requester's employee profile.
        """
        # Resolve requester (validates existence + gets org scope)
        result = await db.execute(
            select(Employee).where(Employee.id == data.requester_id)
        )
        requester = result.scalar_one_or_none()
        if not requester:
            raise NotFoundException("Requester employee not found.")
        if not requester.is_active:
            raise BadRequestException("Inactive employee cannot request a swap.")

        # If a specific target is named, validate it and prevent self-swap
        if data.target_id:
            if data.target_id == data.requester_id:
                raise BadRequestException("You cannot swap a shift with yourself.")
            target_result = await db.execute(
                select(Employee).where(Employee.id == data.target_id)
            )
            if not target_result.scalar_one_or_none():
                raise NotFoundException("Target employee not found.")

        swap = ShiftSwapRequest(
            id=str(uuid.uuid4()),
            requester_id=requester.id,
            target_id=data.target_id,             # null = open offer
            company_id=requester.company_id,      # resolved server-side
            branch_id=requester.branch_id,        # resolved server-side
            original_shift_id=data.original_shift_id,
            reason=data.reason,
            status=SwapStatus.PENDING,            # always starts pending
        )
        db.add(swap)
        await db.flush()
        return swap

    # ── Read ─────────────────────────────────────────────────────────────────

    async def get_swap(self, db: AsyncSession, swap_id: str) -> ShiftSwapRequest:
        """Return a single swap request by ID."""
        result = await db.execute(
            select(ShiftSwapRequest).where(ShiftSwapRequest.id == swap_id)
        )
        swap = result.scalar_one_or_none()
        if not swap:
            raise NotFoundException("Swap request not found.")
        return swap

    async def get_by_employee(self, db: AsyncSession, employee_id: str) -> list[ShiftSwapRequest]:
        """
        Swaps relevant to an employee: ones they requested OR were targeted for,
        newest first. This powers the employee's "My Swaps" view.
        """
        result = await db.execute(
            select(ShiftSwapRequest)
            .where(
                or_(
                    ShiftSwapRequest.requester_id == employee_id,
                    ShiftSwapRequest.target_id == employee_id,
                )
            )
            .order_by(ShiftSwapRequest.created_at.desc())
        )
        return result.scalars().all()

    async def get_by_branch(self, db: AsyncSession, branch_id: str) -> list[ShiftSwapRequest]:
        """All swaps in a branch (manager view), newest first."""
        result = await db.execute(
            select(ShiftSwapRequest)
            .where(ShiftSwapRequest.branch_id == branch_id)
            .order_by(ShiftSwapRequest.created_at.desc())
        )
        return result.scalars().all()

    async def get_pending_manager_approval(
        self, db: AsyncSession, branch_id: str
    ) -> list[ShiftSwapRequest]:
        """
        Manager's approval queue: swaps already ACCEPTED by the coworker and
        awaiting the manager's final decision. Oldest first (FIFO).
        """
        result = await db.execute(
            select(ShiftSwapRequest)
            .where(
                ShiftSwapRequest.branch_id == branch_id,
                ShiftSwapRequest.status == SwapStatus.ACCEPTED,
            )
            .order_by(ShiftSwapRequest.created_at.asc())
        )
        return result.scalars().all()

    # ── Respond (target coworker accepts / declines) ─────────────────────────

    async def respond_swap(
        self, db: AsyncSession, swap_id: str, data: SwapRespondSchema
    ) -> ShiftSwapRequest:
        """
        Target coworker accepts or declines. Only valid while PENDING.
        Stage 1 of the two-stage approval.
        """
        swap = await self.get_swap(db, swap_id)

        if swap.status != SwapStatus.PENDING:
            raise BadRequestException(
                f"Cannot respond to a swap that is already {swap.status.value}."
            )

        # Ownership: only the named target may respond (open offers accept the
        # first responder as the target)
        if swap.target_id is not None and swap.target_id != data.target_id:
            raise BadRequestException("Only the targeted coworker can respond.")

        # For an open offer, the responder becomes the target
        if swap.target_id is None:
            swap.target_id = data.target_id

        swap.status = SwapStatus.ACCEPTED if data.accept else SwapStatus.DECLINED
        swap.responded_at = datetime.now(timezone.utc)

        db.add(swap)
        await db.flush()
        return swap

    # ── Decide (manager approves / rejects) ──────────────────────────────────

    async def decide_swap(
        self, db: AsyncSession, swap_id: str, manager_id: str, data: SwapDecideSchema
    ) -> ShiftSwapRequest:
        """
        Manager approves or rejects an ACCEPTED swap. Stage 2 (final) of approval.
        Only valid while ACCEPTED.
        """
        swap = await self.get_swap(db, swap_id)

        if swap.status != SwapStatus.ACCEPTED:
            raise BadRequestException(
                f"Only an accepted swap can be decided. Current status: {swap.status.value}."
            )

        swap.status = SwapStatus.APPROVED if data.approve else SwapStatus.REJECTED
        swap.manager_id = manager_id
        swap.manager_decided_at = datetime.now(timezone.utc)
        swap.manager_note = data.manager_note

        # NOTE: actual schedule reassignment on APPROVED happens later, once the
        # workforce module supports per-employee shift assignments.

        db.add(swap)
        await db.flush()
        return swap

    # ── Cancel (requester withdraws) ──────────────────────────────────────────

    async def cancel_swap(
        self, db: AsyncSession, swap_id: str, requester_id: str
    ) -> ShiftSwapRequest:
        """
        Requester withdraws their own swap. Allowed while PENDING or ACCEPTED
        (i.e. before the manager has finalized it).
        """
        swap = await self.get_swap(db, swap_id)

        if swap.requester_id != requester_id:
            raise BadRequestException("You can only cancel your own swap requests.")

        if swap.status not in (SwapStatus.PENDING, SwapStatus.ACCEPTED):
            raise BadRequestException(
                f"Cannot cancel a swap that is already {swap.status.value}."
            )

        swap.status = SwapStatus.CANCELLED
        db.add(swap)
        await db.flush()
        return swap


shift_swap_service = ShiftSwapService()
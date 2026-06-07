"""
app/modules/employee_portal/leaves/service.py

================================================================================
LEAVE MANAGEMENT — Business Logic (Service Layer)
================================================================================

WHAT THIS FILE DOES:
    Contains all the business rules for leave requests. The router (HTTP layer)
    stays thin and delegates everything to this service. This is where state
    transitions are enforced, days are computed, and validation happens.

WHERE IT LIVES:
    app/modules/employee_portal/leaves/service.py
    Called by leaves/router.py. Talks to the database and the LeaveRequest model.

CORE RULES ENFORCED HERE:
    1. days_count is computed from the date range — never trusted from client.
    2. end_date cannot be before start_date.
    3. Every new request starts as PENDING.
    4. Only PENDING requests can be approved/rejected (decision is final after).
    5. Only PENDING requests can be cancelled by the employee.
    6. On review, reviewed_by + reviewed_at are stamped automatically.

DESIGN NOTES:
    - company_id / branch_id are pulled from the employee's profile, so the
      client cannot spoof which company a request belongs to.
    - days_count is inclusive (start and end day both count). A one-day leave
      where start == end counts as 1 day. (Weekend/holiday exclusion can be
      layered on later when the holiday calendar exists.)
================================================================================
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.modules.employee_portal.leaves.models import (
    LeaveRequest, LeaveStatus, LeaveType
)
from app.modules.employee_portal.leaves.schemas import (
    LeaveCreateSchema, LeaveReviewSchema
)
from app.modules.employees.models import Employee
from app.core.exceptions import BadRequestException, NotFoundException


class LeaveService:

    # ── Create ───────────────────────────────────────────────────────────────

    async def create_leave(self, db: AsyncSession, data: LeaveCreateSchema) -> LeaveRequest:
        """
        Create a new leave request for an employee.
        Resolves company/branch from the employee profile and computes days_count.
        """
        # Resolve the employee (also validates they exist)
        result = await db.execute(
            select(Employee).where(Employee.id == data.employee_id)
        )
        employee = result.scalar_one_or_none()
        if not employee:
            raise NotFoundException("Employee not found.")
        if not employee.is_active:
            raise BadRequestException("Cannot create leave for an inactive employee.")

        # Validate date range
        if data.end_date < data.start_date:
            raise BadRequestException("End date cannot be before start date.")

        # Compute inclusive day count (both start and end day count)
        days_count = (data.end_date - data.start_date).days + 1

        leave = LeaveRequest(
            id=str(uuid.uuid4()),
            employee_id=employee.id,
            company_id=employee.company_id,   # resolved server-side
            branch_id=employee.branch_id,     # resolved server-side
            leave_type=data.leave_type,
            start_date=data.start_date,
            end_date=data.end_date,
            days_count=days_count,
            reason=data.reason,
            status=LeaveStatus.PENDING,       # always starts pending
        )
        db.add(leave)
        await db.flush()
        return leave

    # ── Read ─────────────────────────────────────────────────────────────────

    async def get_leave(self, db: AsyncSession, leave_id: str) -> LeaveRequest:
        """Return a single leave request by ID."""
        result = await db.execute(
            select(LeaveRequest).where(LeaveRequest.id == leave_id)
        )
        leave = result.scalar_one_or_none()
        if not leave:
            raise NotFoundException("Leave request not found.")
        return leave

    async def get_by_employee(self, db: AsyncSession, employee_id: str) -> list[LeaveRequest]:
        """Return all leave requests for one employee, newest first."""
        result = await db.execute(
            select(LeaveRequest)
            .where(LeaveRequest.employee_id == employee_id)
            .order_by(LeaveRequest.created_at.desc())
        )
        return result.scalars().all()

    async def get_by_branch(self, db: AsyncSession, branch_id: str) -> list[LeaveRequest]:
        """Return all leave requests for a branch (manager view), newest first."""
        result = await db.execute(
            select(LeaveRequest)
            .where(LeaveRequest.branch_id == branch_id)
            .order_by(LeaveRequest.created_at.desc())
        )
        return result.scalars().all()

    async def get_pending_by_branch(self, db: AsyncSession, branch_id: str) -> list[LeaveRequest]:
        """Return only PENDING requests for a branch (manager's approval queue)."""
        result = await db.execute(
            select(LeaveRequest)
            .where(
                LeaveRequest.branch_id == branch_id,
                LeaveRequest.status == LeaveStatus.PENDING,
            )
            .order_by(LeaveRequest.created_at.asc())  # oldest first = FIFO queue
        )
        return result.scalars().all()

    # ── Review (manager approves / rejects) ──────────────────────────────────

    async def review_leave(
        self,
        db: AsyncSession,
        leave_id: str,
        reviewer_id: str,
        data: LeaveReviewSchema,
    ) -> LeaveRequest:
        """
        Approve or reject a pending leave request.
        Only PENDING requests can be reviewed — decision is final afterwards.
        """
        leave = await self.get_leave(db, leave_id)

        if leave.status != LeaveStatus.PENDING:
            raise BadRequestException(
                f"Cannot review a request that is already {leave.status.value}."
            )

        leave.status = LeaveStatus.APPROVED if data.approve else LeaveStatus.REJECTED
        leave.reviewed_by = reviewer_id
        leave.reviewed_at = datetime.now(timezone.utc)
        leave.review_note = data.review_note

        db.add(leave)
        await db.flush()
        return leave

    # ── Cancel (employee withdraws own request) ──────────────────────────────

    async def cancel_leave(
        self, db: AsyncSession, leave_id: str, employee_id: str
    ) -> LeaveRequest:
        """
        Cancel a pending leave request.
        Only the owning employee can cancel, and only while PENDING.
        """
        leave = await self.get_leave(db, leave_id)

        # Ownership check — an employee can only cancel their own request
        if leave.employee_id != employee_id:
            raise BadRequestException("You can only cancel your own leave requests.")

        if leave.status != LeaveStatus.PENDING:
            raise BadRequestException(
                f"Cannot cancel a request that is already {leave.status.value}."
            )

        leave.status = LeaveStatus.CANCELLED
        db.add(leave)
        await db.flush()
        return leave


leave_service = LeaveService()
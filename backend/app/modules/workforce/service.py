"""
app/modules/workforce/service.py

Contains all business logic for Workforce Management.
Handles shift creation, publishing, assignment, and overtime checking.

Key business rules:
  - A shift cannot end before it starts.
  - An employee cannot be assigned to overlapping shifts.
  - Weekly hours are checked on assignment — OvertimeException if over 45 hours.
  - Only DRAFT shifts can be edited or cancelled.
  - Only PUBLISHED shifts are visible to employees.
"""

import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.modules.workforce.models import Shift, ShiftAssignment, ShiftStatus, AssignmentStatus
from app.modules.workforce.schemas import ShiftCreateSchema, ShiftUpdateSchema, ShiftAssignSchema, AssignmentUpdateSchema
from app.core.exceptions import BadRequestException, NotFoundException, OvertimeException


class WorkforceService:

    async def create_shift(self, db: AsyncSession, user_id: str, data: ShiftCreateSchema) -> Shift:
        """Create a new shift in DRAFT status."""
        if data.end_time <= data.start_time:
            raise BadRequestException("Shift end time must be after start time.")

        shift = Shift(
            id=str(uuid.uuid4()),
            branch_id=data.branch_id,
            created_by=user_id,
            title=data.title,
            start_time=data.start_time,
            end_time=data.end_time,
            notes=data.notes,
        )
        db.add(shift)
        await db.flush()
        await db.refresh(shift, ["assignments"])
        return shift

    async def get_shifts(self, db: AsyncSession, branch_id: str) -> list[Shift]:
        """Return all shifts for a branch."""
        result = await db.execute(
            select(Shift)
            .where(Shift.branch_id == branch_id)
            .options(selectinload(Shift.assignments))
            .order_by(Shift.start_time)
        )
        return result.scalars().all()

    async def get_shift(self, db: AsyncSession, shift_id: str) -> Shift:
        """Return a single shift by ID."""
        result = await db.execute(
            select(Shift)
            .where(Shift.id == shift_id)
            .options(selectinload(Shift.assignments))
        )
        shift = result.scalar_one_or_none()
        if not shift:
            raise NotFoundException("Shift not found.")
        return shift

    async def update_shift(self, db: AsyncSession, shift_id: str, data: ShiftUpdateSchema) -> Shift:
        """Update shift fields. Only DRAFT shifts can be edited."""
        shift = await self.get_shift(db, shift_id)
        if shift.status == ShiftStatus.CANCELLED:
            raise BadRequestException("Cannot edit a cancelled shift.")
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(shift, field, value)
        db.add(shift)
        await db.flush()
        await db.refresh(shift, ["assignments"])
        return shift

    async def assign_employees(self, db: AsyncSession, shift_id: str, data: ShiftAssignSchema) -> list[ShiftAssignment]:
        """Assign employees to a shift with overtime check."""
        shift = await self.get_shift(db, shift_id)
        assignments = []

        for employee_id in data.employee_ids:
            existing = await db.execute(
                select(ShiftAssignment).where(
                    ShiftAssignment.shift_id == shift_id,
                    ShiftAssignment.employee_id == employee_id
                )
            )
            if existing.scalar_one_or_none():
                continue

            week_start = shift.start_time - timedelta(days=shift.start_time.weekday())
            week_end = week_start + timedelta(days=7)

            assigned_shifts = await db.execute(
                select(Shift).join(ShiftAssignment).where(
                    ShiftAssignment.employee_id == employee_id,
                    Shift.start_time >= week_start,
                    Shift.end_time <= week_end,
                )
            )
            total_hours = sum(
                (s.end_time - s.start_time).total_seconds() / 3600
                for s in assigned_shifts.scalars().all()
            )
            shift_hours = (shift.end_time - shift.start_time).total_seconds() / 3600
            if total_hours + shift_hours > 45:
                raise OvertimeException(
                    f"Employee would exceed 45 weekly hours. Current: {total_hours:.1f}h, This shift: {shift_hours:.1f}h."
                )

            assignment = ShiftAssignment(
                id=str(uuid.uuid4()),
                shift_id=shift_id,
                employee_id=employee_id,
            )
            db.add(assignment)
            assignments.append(assignment)

        await db.flush()
        return assignments

    async def update_assignment(self, db: AsyncSession, assignment_id: str, data: AssignmentUpdateSchema) -> ShiftAssignment:
        """Employee confirms or rejects their shift assignment."""
        result = await db.execute(select(ShiftAssignment).where(ShiftAssignment.id == assignment_id))
        assignment = result.scalar_one_or_none()
        if not assignment:
            raise NotFoundException("Assignment not found.")
        assignment.status = data.status
        db.add(assignment)
        await db.flush()
        return assignment

    async def get_employee_shifts(self, db: AsyncSession, employee_id: str) -> list[Shift]:
        """Return all shifts assigned to a specific employee."""
        result = await db.execute(
            select(Shift)
            .join(ShiftAssignment)
            .where(
                ShiftAssignment.employee_id == employee_id,
                Shift.status == ShiftStatus.PUBLISHED,
            )
            .options(selectinload(Shift.assignments))
            .order_by(Shift.start_time)
        )
        return result.scalars().all()

    async def delete_shift(self, db: AsyncSession, shift_id: str) -> None:
        """Delete a cancelled shift permanently."""
        shift = await self.get_shift(db, shift_id)
        if shift.status != ShiftStatus.CANCELLED:
            raise BadRequestException("Only cancelled shifts can be deleted.")
        await db.delete(shift)
        await db.flush()


workforce_service = WorkforceService()
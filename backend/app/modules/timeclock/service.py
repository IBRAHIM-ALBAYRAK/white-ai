"""
app/modules/timeclock/service.py

Business logic for Time Clock module.

Key rules:
  - An employee can only have one open record at a time per branch.
  - Check-out closes the open record and calculates total_minutes.
  - total_minutes = (checked_out_at - checked_in_at) in minutes.
  - Manager can manually adjust any record and mark it as adjusted.
  - Missing checkout records can be flagged by manager.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.modules.timeclock.models import TimeRecord, RecordStatus
from app.modules.timeclock.schemas import CheckInSchema, CheckOutSchema, AdjustRecordSchema
from app.core.exceptions import BadRequestException, NotFoundException


class TimeClockService:

    # ── Check In ─────────────────────────────────────────────────────────────

    async def check_in(self, db: AsyncSession, data: CheckInSchema) -> TimeRecord:
        """Create a new open time record for the employee."""

        # Block if employee already has an open record
        existing = await db.execute(
            select(TimeRecord).where(
                TimeRecord.employee_id == data.employee_id,
                TimeRecord.branch_id == data.branch_id,
                TimeRecord.status == RecordStatus.OPEN,
            )
        )
        if existing.scalar_one_or_none():
            raise BadRequestException("Employee already has an open check-in. Check out first.")

        record = TimeRecord(
            id=str(uuid.uuid4()),
            branch_id=data.branch_id,
            employee_id=data.employee_id,
            checked_in_at=data.checked_in_at or datetime.now(timezone.utc),
            is_late=data.is_late or False,
            status=RecordStatus.OPEN,
        )
        db.add(record)
        await db.flush()
        return record

    # ── Check Out ────────────────────────────────────────────────────────────

    async def check_out(self, db: AsyncSession, record_id: str, data: CheckOutSchema) -> TimeRecord:
        """Close an open record and calculate total_minutes."""
        record = await self._get_record(db, record_id)

        if record.status != RecordStatus.OPEN:
            raise BadRequestException("This record is not open. Cannot check out.")

        checked_out_at = data.checked_out_at or datetime.now(timezone.utc)

        if checked_out_at <= record.checked_in_at:
            raise BadRequestException("Check-out time must be after check-in time.")

        total_minutes = int((checked_out_at - record.checked_in_at).total_seconds() / 60)

        record.checked_out_at = checked_out_at
        record.total_minutes = total_minutes
        record.status = RecordStatus.COMPLETED

        db.add(record)
        await db.flush()
        return record

    # ── Get Records ──────────────────────────────────────────────────────────

    async def get_branch_records(self, db: AsyncSession, branch_id: str) -> list[TimeRecord]:
        """Return all time records for a branch, newest first."""
        result = await db.execute(
            select(TimeRecord)
            .where(TimeRecord.branch_id == branch_id)
            .order_by(TimeRecord.checked_in_at.desc())
        )
        return result.scalars().all()

    async def get_employee_records(self, db: AsyncSession, employee_id: str, branch_id: str) -> list[TimeRecord]:
        """Return all time records for a specific employee in a branch."""
        result = await db.execute(
            select(TimeRecord)
            .where(
                TimeRecord.employee_id == employee_id,
                TimeRecord.branch_id == branch_id,
            )
            .order_by(TimeRecord.checked_in_at.desc())
        )
        return result.scalars().all()

    async def get_open_records(self, db: AsyncSession, branch_id: str) -> list[TimeRecord]:
        """Return all currently open records for a branch."""
        result = await db.execute(
            select(TimeRecord).where(
                TimeRecord.branch_id == branch_id,
                TimeRecord.status == RecordStatus.OPEN,
            )
        )
        return result.scalars().all()

    # ── Adjust ───────────────────────────────────────────────────────────────

    async def adjust_record(self, db: AsyncSession, record_id: str, data: AdjustRecordSchema) -> TimeRecord:
        """Manager manually adjusts a record."""
        record = await self._get_record(db, record_id)

        if data.checked_in_at:
            record.checked_in_at = data.checked_in_at
        if data.checked_out_at:
            record.checked_out_at = data.checked_out_at
        if data.notes:
            record.notes = data.notes
        if data.is_late is not None:
            record.is_late = data.is_late

        # Recalculate total_minutes if both times are present
        if record.checked_in_at and record.checked_out_at:
            record.total_minutes = int(
                (record.checked_out_at - record.checked_in_at).total_seconds() / 60
            )

        record.status = RecordStatus.ADJUSTED
        db.add(record)
        await db.flush()
        return record

    async def flag_missing_checkout(self, db: AsyncSession, record_id: str) -> TimeRecord:
        """Flag an open record as missing checkout."""
        record = await self._get_record(db, record_id)
        if record.status != RecordStatus.OPEN:
            raise BadRequestException("Only open records can be flagged as missing checkout.")
        record.status = RecordStatus.MISSING_CHECKOUT
        db.add(record)
        await db.flush()
        return record

    # ── Internal ─────────────────────────────────────────────────────────────

    async def _get_record(self, db: AsyncSession, record_id: str) -> TimeRecord:
        result = await db.execute(select(TimeRecord).where(TimeRecord.id == record_id))
        record = result.scalar_one_or_none()
        if not record:
            raise NotFoundException("Time record not found.")
        return record


timeclock_service = TimeClockService()
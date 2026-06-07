"""
app/modules/employee_portal/announcements/service.py

================================================================================
ANNOUNCEMENTS — Business Logic (Service Layer)
================================================================================

WHAT THIS FILE DOES:
    Contains the business rules for announcements: creating, editing, hiding, and
    — most importantly — the targeting logic that decides which announcements a
    given employee should see in their feed.

WHERE IT LIVES:
    app/modules/employee_portal/announcements/service.py
    Called by announcements/router.py. Talks to the Announcement model.

CORE RULES ENFORCED HERE:
    1. created_by is stamped from the authenticated manager — never client input.
    2. Hiding an announcement = is_active False (soft). Rows are not deleted.
    3. Feed targeting: an employee sees announcements that are either
         (a) company-wide for their company (branch_id IS NULL), OR
         (b) specifically targeted at their branch (branch_id = their branch)
       and that are currently active.

DESIGN NOTES:
    - The employee feed query (get_feed_for_employee) is the heart of this module.
      It combines company-wide + branch-specific posts in one ordered list,
      newest first, so the portal can render a single clean timeline.
    - Manager-facing lists (get_by_company) return everything including hidden
      posts, so managers can re-activate or audit them.
================================================================================
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from app.modules.employee_portal.announcements.models import Announcement
from app.modules.employee_portal.announcements.schemas import (
    AnnouncementCreateSchema, AnnouncementUpdateSchema
)
from app.modules.employees.models import Employee
from app.core.exceptions import BadRequestException, NotFoundException


class AnnouncementService:

    # ── Create ───────────────────────────────────────────────────────────────

    async def create_announcement(
        self, db: AsyncSession, creator_id: str, data: AnnouncementCreateSchema
    ) -> Announcement:
        """
        Publish a new announcement.
        creator_id comes from the authenticated manager's token.
        """
        announcement = Announcement(
            id=str(uuid.uuid4()),
            company_id=data.company_id,
            branch_id=data.branch_id,         # null = company-wide
            title=data.title,
            content=data.content,
            created_by=creator_id,            # stamped server-side
            is_active=True,
            published_at=datetime.now(timezone.utc),
        )
        db.add(announcement)
        await db.flush()
        return announcement

    # ── Read ─────────────────────────────────────────────────────────────────

    async def get_announcement(self, db: AsyncSession, announcement_id: str) -> Announcement:
        """Return a single announcement by ID."""
        result = await db.execute(
            select(Announcement).where(Announcement.id == announcement_id)
        )
        announcement = result.scalar_one_or_none()
        if not announcement:
            raise NotFoundException("Announcement not found.")
        return announcement

    async def get_by_company(self, db: AsyncSession, company_id: str) -> list[Announcement]:
        """
        Manager view: ALL announcements for a company (including hidden ones),
        newest first. Lets managers audit and re-activate posts.
        """
        result = await db.execute(
            select(Announcement)
            .where(Announcement.company_id == company_id)
            .order_by(Announcement.published_at.desc())
        )
        return result.scalars().all()

    async def get_feed_for_employee(self, db: AsyncSession, employee_id: str) -> list[Announcement]:
        """
        Employee view: the news feed an employee should see.

        Returns ACTIVE announcements that are either:
          (a) company-wide for the employee's company (branch_id IS NULL), or
          (b) targeted at the employee's specific branch.
        Ordered newest first.
        """
        # Resolve the employee to know their company + branch
        result = await db.execute(
            select(Employee).where(Employee.id == employee_id)
        )
        employee = result.scalar_one_or_none()
        if not employee:
            raise NotFoundException("Employee not found.")

        result = await db.execute(
            select(Announcement)
            .where(
                Announcement.company_id == employee.company_id,
                Announcement.is_active == True,
                or_(
                    Announcement.branch_id.is_(None),              # company-wide
                    Announcement.branch_id == employee.branch_id,  # their branch
                ),
            )
            .order_by(Announcement.published_at.desc())
        )
        return result.scalars().all()

    # ── Update / Hide ─────────────────────────────────────────────────────────

    async def update_announcement(
        self, db: AsyncSession, announcement_id: str, data: AnnouncementUpdateSchema
    ) -> Announcement:
        """
        Edit an announcement or toggle its visibility (is_active).
        Only provided fields are changed.
        """
        announcement = await self.get_announcement(db, announcement_id)
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(announcement, field, value)
        db.add(announcement)
        await db.flush()
        return announcement


announcement_service = AnnouncementService()
"""
app/modules/employee_portal/announcements/router.py

================================================================================
ANNOUNCEMENTS — API Router (HTTP Layer)
================================================================================

Thin HTTP layer over announcement_service. The author (created_by) comes from
the auth token, never the request body.

ENDPOINTS:
    POST   /api/v1/announcements                 → manager posts an announcement
    GET    /api/v1/announcements/company/{id}     → manager view (all, incl. hidden)
    GET    /api/v1/announcements/feed/{emp_id}    → employee feed (active, targeted)
    GET    /api/v1/announcements/{id}             → single announcement
    PUT    /api/v1/announcements/{id}             → edit / hide

TENANT ISOLATION:
    - company-scoped endpoints (create / list-by-company): assert_company_access
    - single-announcement endpoints (get / update): _assert_announcement resolves
      the announcement's company and checks access
    - feed: assert_employee_access (own-profile for plain employees) PLUS
      assert_employee_company_access for admins (tenant scope)
================================================================================
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import (
    get_current_user, require_role,
    assert_employee_access, assert_company_access, assert_employee_company_access,
)
from app.modules.auth.models import User, UserRole
from app.modules.employee_portal.announcements.schemas import (
    AnnouncementCreateSchema,
    AnnouncementUpdateSchema,
    AnnouncementResponseSchema,
)
from app.modules.employee_portal.announcements.service import announcement_service

router = APIRouter(prefix="/announcements", tags=["Announcements"])

staff = require_role(UserRole.SUPERADMIN, UserRole.OWNER, UserRole.MANAGER)
ADMIN_ROLES = (UserRole.SUPERADMIN, UserRole.OWNER, UserRole.MANAGER)


async def _assert_announcement(db: AsyncSession, current_user: User, announcement_id: str) -> None:
    """Resolve an announcement's company and assert the caller can access it."""
    ann = await announcement_service.get_announcement(db, announcement_id)
    await assert_company_access(db, current_user, ann.company_id)


@router.post("", response_model=AnnouncementResponseSchema)
async def create_announcement(
    data: AnnouncementCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await assert_company_access(db, current_user, data.company_id)
    return await announcement_service.create_announcement(
        db, creator_id=current_user.id, data=data
    )


@router.get("/company/{company_id}", response_model=list[AnnouncementResponseSchema])
async def list_by_company(
    company_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await assert_company_access(db, current_user, company_id)
    return await announcement_service.get_by_company(db, company_id)


@router.get("/feed/{employee_id}", response_model=list[AnnouncementResponseSchema])
async def get_feed(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await assert_employee_access(db, current_user, employee_id)
    if current_user.role in ADMIN_ROLES:
        await assert_employee_company_access(db, current_user, employee_id)
    return await announcement_service.get_feed_for_employee(db, employee_id)


@router.get("/{announcement_id}", response_model=AnnouncementResponseSchema)
async def get_announcement(
    announcement_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await _assert_announcement(db, current_user, announcement_id)
    return await announcement_service.get_announcement(db, announcement_id)


@router.put("/{announcement_id}", response_model=AnnouncementResponseSchema)
async def update_announcement(
    announcement_id: str,
    data: AnnouncementUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await _assert_announcement(db, current_user, announcement_id)
    return await announcement_service.update_announcement(db, announcement_id, data)
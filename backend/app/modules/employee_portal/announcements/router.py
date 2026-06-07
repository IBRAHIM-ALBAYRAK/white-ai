"""
app/modules/employee_portal/announcements/router.py

================================================================================
ANNOUNCEMENTS — API Router (HTTP Layer)
================================================================================

WHAT THIS FILE DOES:
    Exposes the announcements endpoints over HTTP. Thin layer: authenticates,
    parses input, delegates to announcement_service. The author (created_by) is
    taken from the auth token, never from the request body.

WHERE IT LIVES:
    app/modules/employee_portal/announcements/router.py
    Registered in app/main.py under the /api/v1 prefix.

ENDPOINTS:
    POST   /api/v1/announcements                 → manager posts an announcement
    GET    /api/v1/announcements/company/{id}     → manager view (all, incl. hidden)
    GET    /api/v1/announcements/feed/{emp_id}    → employee feed (active, targeted)
    GET    /api/v1/announcements/{id}             → single announcement
    PUT    /api/v1/announcements/{id}             → edit / hide

AUTH:
    All endpoints require a valid Bearer token. On create, the manager's user id
    (token "sub") is stamped as created_by.
================================================================================
"""



from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user, require_role, assert_employee_access
from app.modules.auth.models import User, UserRole
from app.modules.employee_portal.announcements.schemas import (
    AnnouncementCreateSchema,
    AnnouncementUpdateSchema,
    AnnouncementResponseSchema,
)
from app.modules.employee_portal.announcements.service import announcement_service

router = APIRouter(prefix="/announcements", tags=["Announcements"])

staff = require_role(UserRole.SUPERADMIN, UserRole.OWNER, UserRole.MANAGER)


@router.post("", response_model=AnnouncementResponseSchema)
async def create_announcement(
    data: AnnouncementCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    return await announcement_service.create_announcement(
        db, creator_id=current_user.id, data=data
    )


@router.get("/company/{company_id}", response_model=list[AnnouncementResponseSchema])
async def list_by_company(
    company_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    return await announcement_service.get_by_company(db, company_id)


@router.get("/feed/{employee_id}", response_model=list[AnnouncementResponseSchema])
async def get_feed(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await assert_employee_access(db, current_user, employee_id)
    return await announcement_service.get_feed_for_employee(db, employee_id)


@router.get("/{announcement_id}", response_model=AnnouncementResponseSchema)
async def get_announcement(
    announcement_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    return await announcement_service.get_announcement(db, announcement_id)


@router.put("/{announcement_id}", response_model=AnnouncementResponseSchema)
async def update_announcement(
    announcement_id: str,
    data: AnnouncementUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    return await announcement_service.update_announcement(db, announcement_id, data)
"""
app/modules/inventory/change_request_router.py

Franchise inventory change-request approval flow (HTTP layer).

  POST /api/v1/inventory/change-requests                  → franchise submits a request
  GET  /api/v1/inventory/change-requests/company/{id}      → list requests (franchise own / brand oversight)
  GET  /api/v1/inventory/change-requests/company/{id}/pending → pending only
  PUT  /api/v1/inventory/change-requests/{id}/approve      → BRAND approves (auto-applies)
  PUT  /api/v1/inventory/change-requests/{id}/reject       → BRAND rejects

Authorization:
  - Submit: any staff of the company; the request's company_id is taken from the
    caller's token (current_user.company_id), never the body.
  - List: assert_company_access — franchise sees its own; brand sees via oversight.
  - Approve/Reject: BRAND ONLY. The reviewer's company must be the brand of the
    request's company (an oversight link must exist brand→sub). A franchise cannot
    approve its own request because no oversight link points from itself to itself.
    Superadmin may always review.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import (
    get_current_user, require_role,
    assert_company_access, get_oversight_link_type,
)
from app.modules.auth.models import User, UserRole
from app.modules.inventory.change_request_schemas import (
    ChangeRequestCreateSchema,
    ChangeRequestReviewSchema,
    ChangeRequestResponseSchema,
)
from app.modules.inventory.change_request_service import change_request_service

router = APIRouter(prefix="/inventory/change-requests", tags=["Inventory Change Requests"])

staff = require_role(UserRole.SUPERADMIN, UserRole.OWNER, UserRole.MANAGER)


async def _assert_brand_reviewer(db: AsyncSession, current_user: User, request_id: str):
    """
    Only the BRAND of the request's company (or superadmin) may approve/reject.
    Returns the loaded request for reuse.
    """
    req = await change_request_service.get_request(db, request_id)

    if current_user.role == UserRole.SUPERADMIN:
        return req

    if current_user.company_id is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Yetkiniz yok.")

    # The reviewer's company must be the brand that oversees the request's company.
    link_type = await get_oversight_link_type(db, current_user.company_id, req.company_id)
    if link_type is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu talebi yalnizca markasi onaylayabilir/reddedebilir.",
        )
    return req


@router.post("", response_model=ChangeRequestResponseSchema)
async def create_request(
    data: ChangeRequestCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    if current_user.company_id is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bir sirkete bagli degilsiniz.")
    return await change_request_service.create_request(
        db, company_id=current_user.company_id, requester_id=current_user.id, data=data
    )


@router.get("/company/{company_id}", response_model=list[ChangeRequestResponseSchema])
async def list_by_company(
    company_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await assert_company_access(db, current_user, company_id)
    return await change_request_service.get_by_company(db, company_id)


@router.get("/company/{company_id}/pending", response_model=list[ChangeRequestResponseSchema])
async def list_pending_by_company(
    company_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await assert_company_access(db, current_user, company_id)
    return await change_request_service.get_pending_by_company(db, company_id)


@router.put("/{request_id}/approve", response_model=ChangeRequestResponseSchema)
async def approve_request(
    request_id: str,
    data: ChangeRequestReviewSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await _assert_brand_reviewer(db, current_user, request_id)
    return await change_request_service.approve_request(
        db, request_id=request_id, reviewer_id=current_user.id, note=data.note
    )


@router.put("/{request_id}/reject", response_model=ChangeRequestResponseSchema)
async def reject_request(
    request_id: str,
    data: ChangeRequestReviewSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await _assert_brand_reviewer(db, current_user, request_id)
    return await change_request_service.reject_request(
        db, request_id=request_id, reviewer_id=current_user.id, note=data.note
    )

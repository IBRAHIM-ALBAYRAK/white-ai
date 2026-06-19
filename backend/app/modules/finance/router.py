"""
app/modules/finance/router.py

Finance ledger endpoints (Gelir / Gider) — brand-owner above-store view.
  Categories:
    GET    /finance/categories
    POST   /finance/categories
    DELETE /finance/categories/{id}
  Entries (soft-delete, audit-logged):
    GET    /finance/entries            (?include_deleted=true to show archived)
    POST   /finance/entries
    PUT    /finance/entries/{id}       (admin_password required)
    DELETE /finance/entries/{id}       (admin_password required, soft delete)
  Audit:
    GET    /finance/audit
  Overview:
    GET    /finance/overview/{year}/{month}

Staff-only. Scoped to the user's own company. Edit/Delete require the acting
user's account password (same pattern as employee termination).
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import require_role
from app.modules.auth.models import User, UserRole
from app.modules.finance.schemas import (
    FinanceCategoryCreateSchema, FinanceCategoryResponseSchema,
    FinanceEntryCreateSchema, FinanceEntryUpdateSchema, FinanceEntryResponseSchema,
    FinanceEntryDeleteSchema, FinanceAuditLogResponseSchema,
    FinanceOverviewSchema,
)
from app.modules.finance.service import finance_service

router = APIRouter(prefix="/finance", tags=["Finance"])
staff = require_role(UserRole.SUPERADMIN, UserRole.OWNER, UserRole.MANAGER)


def _company_id(user: User) -> str:
    if not user.company_id:
        raise HTTPException(status_code=400, detail="User has no company.")
    return user.company_id


# ── Categories ──
@router.get("/categories", response_model=list[FinanceCategoryResponseSchema])
async def list_categories(
    kind: str | None = Query(default=None),
    scope: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    cats = await finance_service.list_categories(db, _company_id(current_user), kind, scope)
    return [
        FinanceCategoryResponseSchema(
            id=c.id, company_id=c.company_id, name=c.name,
            kind=c.kind.value if hasattr(c.kind, "value") else c.kind,
            scope=getattr(c, "scope", None), is_active=c.is_active, created_at=c.created_at,
        ) for c in cats
    ]


@router.post("/categories", response_model=FinanceCategoryResponseSchema)
async def create_category(
    data: FinanceCategoryCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    c = await finance_service.create_category(db, _company_id(current_user), data.name, data.kind, data.scope)
    return FinanceCategoryResponseSchema(
        id=c.id, company_id=c.company_id, name=c.name,
        kind=c.kind.value if hasattr(c.kind, "value") else c.kind,
        scope=getattr(c, "scope", None), is_active=c.is_active, created_at=c.created_at,
    )


@router.delete("/categories/{category_id}")
async def delete_category(
    category_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    return await finance_service.delete_category(db, _company_id(current_user), category_id)


# ── Entries ──
@router.get("/entries", response_model=list[FinanceEntryResponseSchema])
async def list_entries(
    year: int | None = Query(default=None),
    month: int | None = Query(default=None),
    branch_id: str | None = Query(default=None),
    kind: str | None = Query(default=None),
    include_deleted: bool = Query(default=False),
    scope: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    return await finance_service.list_entries(
        db, _company_id(current_user), year, month, branch_id, kind, include_deleted, scope
    )


@router.post("/entries", response_model=FinanceEntryResponseSchema)
async def create_entry(
    data: FinanceEntryCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    e = await finance_service.create_entry(
        db, _company_id(current_user), current_user,
        data.category_id, data.amount, data.entry_date, data.branch_id, data.note,
    )
    return FinanceEntryResponseSchema(
        id=e.id, company_id=e.company_id, category_id=e.category_id, category_name=None,
        kind=e.kind.value if hasattr(e.kind, "value") else e.kind,
        amount=e.amount, entry_date=e.entry_date, branch_id=e.branch_id,
        note=e.note, created_at=e.created_at, is_deleted=e.is_deleted,
    )


@router.put("/entries/{entry_id}", response_model=FinanceEntryResponseSchema)
async def update_entry(
    entry_id: str,
    data: FinanceEntryUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    if not data.admin_password:
        raise HTTPException(status_code=400, detail="admin_password gerekli.")
    e = await finance_service.update_entry(
        db, _company_id(current_user), current_user, entry_id, data.admin_password,
        data.category_id, data.amount, data.entry_date, data.branch_id, data.note,
    )
    return FinanceEntryResponseSchema(
        id=e.id, company_id=e.company_id, category_id=e.category_id, category_name=None,
        kind=e.kind.value if hasattr(e.kind, "value") else e.kind,
        amount=e.amount, entry_date=e.entry_date, branch_id=e.branch_id,
        note=e.note, created_at=e.created_at, is_deleted=e.is_deleted,
    )


@router.delete("/entries/{entry_id}")
async def delete_entry(
    entry_id: str,
    data: FinanceEntryDeleteSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    if not data.admin_password:
        raise HTTPException(status_code=400, detail="admin_password gerekli.")
    return await finance_service.delete_entry(
        db, _company_id(current_user), current_user, entry_id, data.admin_password
    )


# ── Audit ──
@router.get("/audit", response_model=list[FinanceAuditLogResponseSchema])
async def list_audit(
    limit: int = Query(default=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    return await finance_service.list_audit(db, _company_id(current_user), limit)


# ── Overview ──
@router.get("/overview/{year}/{month}", response_model=FinanceOverviewSchema)
async def overview(
    year: int, month: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    return await finance_service.overview(db, _company_id(current_user), year, month)


@router.get("/tax-profile")
async def tax_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    from sqlalchemy import select
    from app.modules.company.models import Company
    cid = _company_id(current_user)
    res = await db.execute(select(Company).where(Company.id == cid))
    c = res.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=404, detail="Sirket bulunamadi.")
    return {"company_id": c.id, "name": c.name, "legal_name": c.legal_name, "legal_type": getattr(c, "legal_type", "limited") or "limited"}

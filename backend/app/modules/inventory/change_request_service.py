"""
app/modules/inventory/change_request_service.py

Business logic for the franchise inventory change-request approval flow.

Flow:
  1. Franchise sub-owner creates a request (status=pending).
  2. Brand-owner lists pending requests for the franchise.
  3. Brand approves  -> the structural change is AUTO-APPLIED via inventory_service,
     status=approved, reviewer + timestamp stamped.
  4. Brand rejects   -> nothing applied, status=rejected.

Only structural changes (add/edit/delete product) go through here. Daily stock
movements are NOT part of this flow — the franchise performs those freely.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.inventory.models import (
    InventoryChangeRequest, ChangeAction, ChangeStatus, Product,
)
from app.modules.inventory.change_request_schemas import ChangeRequestCreateSchema
from app.modules.inventory.schemas import ProductCreateSchema, ProductUpdateSchema
from app.modules.inventory.service import inventory_service
from app.core.exceptions import BadRequestException, NotFoundException


class ChangeRequestService:

    # ── Create (franchise) ────────────────────────────────────────────────
    async def create_request(
        self, db: AsyncSession, company_id: str, requester_id: str, data: ChangeRequestCreateSchema
    ) -> InventoryChangeRequest:
        action = data.action.lower()
        if action not in ("create", "update", "delete"):
            raise BadRequestException("Gecersiz islem tipi. (create/update/delete)")

        if action in ("update", "delete") and not data.target_product_id:
            raise BadRequestException("Guncelleme/silme icin target_product_id zorunlu.")
        if action in ("create", "update") and not data.payload:
            raise BadRequestException("Ekleme/guncelleme icin payload zorunlu.")

        req = InventoryChangeRequest(
            id=str(uuid.uuid4()),
            company_id=company_id,
            branch_id=data.branch_id,
            requested_by=requester_id,
            action=ChangeAction(action),
            target_product_id=data.target_product_id,
            payload=data.payload,
            status=ChangeStatus.PENDING,
        )
        db.add(req)
        await db.flush()
        await db.refresh(req)
        return req

    # ── Read ──────────────────────────────────────────────────────────────
    async def get_request(self, db: AsyncSession, request_id: str) -> InventoryChangeRequest:
        req = (await db.execute(
            select(InventoryChangeRequest).where(InventoryChangeRequest.id == request_id)
        )).scalar_one_or_none()
        if req is None:
            raise NotFoundException("Degisiklik talebi bulunamadi.")
        return req

    async def get_by_company(self, db: AsyncSession, company_id: str) -> list[InventoryChangeRequest]:
        rows = (await db.execute(
            select(InventoryChangeRequest)
            .where(InventoryChangeRequest.company_id == company_id)
            .order_by(InventoryChangeRequest.created_at.desc())
        )).scalars().all()
        return rows

    async def get_pending_by_company(self, db: AsyncSession, company_id: str) -> list[InventoryChangeRequest]:
        rows = (await db.execute(
            select(InventoryChangeRequest)
            .where(
                InventoryChangeRequest.company_id == company_id,
                InventoryChangeRequest.status == ChangeStatus.PENDING,
            )
            .order_by(InventoryChangeRequest.created_at.desc())
        )).scalars().all()
        return rows

    # ── Approve (brand) -> auto-apply ──────────────────────────────────────
    async def approve_request(
        self, db: AsyncSession, request_id: str, reviewer_id: str, note: str | None = None
    ) -> InventoryChangeRequest:
        req = await self.get_request(db, request_id)
        if req.status != ChangeStatus.PENDING:
            raise BadRequestException("Bu talep zaten sonuclanmis.")

        # Apply the structural change based on action.
        if req.action == ChangeAction.CREATE:
            payload = dict(req.payload or {})
            payload["branch_id"] = req.branch_id  # enforce the request's branch
            await inventory_service.create_product(db, ProductCreateSchema(**payload))

        elif req.action == ChangeAction.UPDATE:
            if not req.target_product_id:
                raise BadRequestException("Hedef urun yok.")
            await inventory_service.update_product(
                db, req.target_product_id, ProductUpdateSchema(**(req.payload or {}))
            )

        elif req.action == ChangeAction.DELETE:
            if not req.target_product_id:
                raise BadRequestException("Hedef urun yok.")
            await inventory_service.delete_product(db, req.target_product_id)

        req.status = ChangeStatus.APPROVED
        req.reviewed_by = reviewer_id
        req.review_note = note
        req.reviewed_at = datetime.now(timezone.utc)
        await db.flush()
        await db.refresh(req)
        return req

    # ── Reject (brand) ──────────────────────────────────────────────────────
    async def reject_request(
        self, db: AsyncSession, request_id: str, reviewer_id: str, note: str | None = None
    ) -> InventoryChangeRequest:
        req = await self.get_request(db, request_id)
        if req.status != ChangeStatus.PENDING:
            raise BadRequestException("Bu talep zaten sonuclanmis.")
        req.status = ChangeStatus.REJECTED
        req.reviewed_by = reviewer_id
        req.review_note = note
        req.reviewed_at = datetime.now(timezone.utc)
        await db.flush()
        await db.refresh(req)
        return req


change_request_service = ChangeRequestService()

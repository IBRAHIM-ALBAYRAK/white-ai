"""
app/modules/finance/service.py
Business logic for the Finance ledger + overview aggregation + audit trail.
"""
from datetime import date, datetime, timezone
from calendar import monthrange

from fastapi import HTTPException
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import verify_password
from app.modules.finance.models import (
    FinanceCategory, FinanceEntry, FinanceKind,
    FinanceAuditLog, FinanceAuditAction,
)
from app.modules.inventory.models import StockTransfer, WarehouseStock, DestKind, TransferStatus
from app.modules.payroll.models import Payslip
from app.modules.employees.models import Employee
from app.modules.company.models import OversightLink
from app.modules.auth.models import User


def _fmt_amount(a: float) -> str:
    try:
        return f"{a:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    except Exception:
        return str(a)


class FinanceService:
    # ── audit helper ──
    async def _log(self, db, company_id, entry, action, actor, old_value=None, new_value=None):
        actor_name = None
        if actor is not None:
            fn = getattr(actor, "first_name", "") or ""
            ln = getattr(actor, "last_name", "") or ""
            actor_name = (fn + " " + ln).strip() or getattr(actor, "email", None)
        log = FinanceAuditLog(
            company_id=company_id,
            entry_id=entry.id if entry else None,
            action=action,
            kind=entry.kind if entry else None,
            category_name=None,
            amount=entry.amount if entry else None,
            old_value=old_value, new_value=new_value,
            actor_id=actor.id if actor else None,
            actor_name=actor_name,
        )
        db.add(log)

    # ── Categories ──
    async def list_categories(self, db: AsyncSession, company_id: str, kind: str | None = None):
        q = select(FinanceCategory).where(
            FinanceCategory.company_id == company_id,
            FinanceCategory.is_active == True,
        )
        if kind:
            q = q.where(FinanceCategory.kind == FinanceKind(kind))
        q = q.order_by(FinanceCategory.created_at)
        return (await db.execute(q)).scalars().all()

    async def create_category(self, db: AsyncSession, company_id: str, name: str, kind: str):
        if kind not in ("income", "expense"):
            raise HTTPException(status_code=400, detail="kind must be income or expense.")
        cat = FinanceCategory(company_id=company_id, name=name.strip(), kind=FinanceKind(kind))
        db.add(cat)
        await db.commit()
        await db.refresh(cat)
        return cat

    async def delete_category(self, db: AsyncSession, company_id: str, category_id: str):
        cat = (await db.execute(
            select(FinanceCategory).where(
                FinanceCategory.id == category_id,
                FinanceCategory.company_id == company_id,
            )
        )).scalar_one_or_none()
        if cat is None:
            raise HTTPException(status_code=404, detail="Category not found.")
        cat.is_active = False
        await db.commit()
        return {"ok": True}

    async def _cat_name(self, db, category_id):
        c = (await db.execute(
            select(FinanceCategory.name).where(FinanceCategory.id == category_id)
        )).scalar_one_or_none()
        return c or "—"

    # ── Entries ──
    async def list_entries(self, db: AsyncSession, company_id: str,
                           year: int | None = None, month: int | None = None,
                           branch_id: str | None = None, kind: str | None = None,
                           include_deleted: bool = False):
        q = select(FinanceEntry, FinanceCategory.name).join(
            FinanceCategory, FinanceEntry.category_id == FinanceCategory.id
        ).where(FinanceEntry.company_id == company_id)
        if not include_deleted:
            q = q.where(FinanceEntry.is_deleted == False)
        if year and month:
            start = date(year, month, 1)
            end = date(year, month, monthrange(year, month)[1])
            q = q.where(and_(FinanceEntry.entry_date >= start, FinanceEntry.entry_date <= end))
        if branch_id:
            q = q.where(FinanceEntry.branch_id == branch_id)
        if kind:
            q = q.where(FinanceEntry.kind == FinanceKind(kind))
        q = q.order_by(FinanceEntry.entry_date.desc(), FinanceEntry.created_at.desc())
        rows = (await db.execute(q)).all()
        out = []
        for entry, cat_name in rows:
            out.append({
                "id": entry.id, "company_id": entry.company_id, "category_id": entry.category_id,
                "category_name": cat_name, "kind": entry.kind.value if hasattr(entry.kind, "value") else entry.kind,
                "amount": entry.amount, "entry_date": entry.entry_date,
                "branch_id": entry.branch_id, "note": entry.note, "created_at": entry.created_at,
                "is_deleted": entry.is_deleted,
            })
        return out

    async def create_entry(self, db: AsyncSession, company_id: str, actor: User,
                           category_id: str, amount: float,
                           entry_date: date | None, branch_id: str | None, note: str | None):
        cat = (await db.execute(
            select(FinanceCategory).where(
                FinanceCategory.id == category_id,
                FinanceCategory.company_id == company_id,
            )
        )).scalar_one_or_none()
        if cat is None:
            raise HTTPException(status_code=404, detail="Category not found.")
        entry = FinanceEntry(
            company_id=company_id, category_id=category_id, kind=cat.kind,
            amount=amount, entry_date=entry_date or date.today(),
            branch_id=branch_id, note=note, created_by=actor.id,
        )
        db.add(entry)
        await db.flush()
        new_val = f"{cat.name} · {_fmt_amount(amount)}"
        await self._log(db, company_id, entry, FinanceAuditAction.created, actor, None, new_val)
        await db.commit()
        await db.refresh(entry)
        return entry

    async def update_entry(self, db: AsyncSession, company_id: str, actor: User, entry_id: str,
                           admin_password: str, category_id, amount, entry_date, branch_id, note):
        # sifre dogrula
        if not verify_password(admin_password, actor.hashed_password):
            raise HTTPException(status_code=403, detail="Şifre hatalı.")
        entry = (await db.execute(
            select(FinanceEntry).where(
                FinanceEntry.id == entry_id,
                FinanceEntry.company_id == company_id,
                FinanceEntry.is_deleted == False,
            )
        )).scalar_one_or_none()
        if entry is None:
            raise HTTPException(status_code=404, detail="Entry not found.")
        old_cat = await self._cat_name(db, entry.category_id)
        old_val = f"{old_cat} · {_fmt_amount(entry.amount)}"
        # uygula
        if category_id is not None:
            cat = (await db.execute(
                select(FinanceCategory).where(
                    FinanceCategory.id == category_id,
                    FinanceCategory.company_id == company_id,
                )
            )).scalar_one_or_none()
            if cat is None:
                raise HTTPException(status_code=404, detail="Category not found.")
            entry.category_id = category_id
            entry.kind = cat.kind
        if amount is not None:
            entry.amount = amount
        if entry_date is not None:
            entry.entry_date = entry_date
        if branch_id is not None:
            entry.branch_id = branch_id or None
        if note is not None:
            entry.note = note
        entry.updated_at = datetime.now(timezone.utc)
        new_cat = await self._cat_name(db, entry.category_id)
        new_val = f"{new_cat} · {_fmt_amount(entry.amount)}"
        await self._log(db, company_id, entry, FinanceAuditAction.updated, actor, old_val, new_val)
        await db.commit()
        await db.refresh(entry)
        return entry

    async def delete_entry(self, db: AsyncSession, company_id: str, actor: User,
                           entry_id: str, admin_password: str):
        if not verify_password(admin_password, actor.hashed_password):
            raise HTTPException(status_code=403, detail="Şifre hatalı.")
        entry = (await db.execute(
            select(FinanceEntry).where(
                FinanceEntry.id == entry_id,
                FinanceEntry.company_id == company_id,
                FinanceEntry.is_deleted == False,
            )
        )).scalar_one_or_none()
        if entry is None:
            raise HTTPException(status_code=404, detail="Entry not found.")
        cat = await self._cat_name(db, entry.category_id)
        old_val = f"{cat} · {_fmt_amount(entry.amount)}"
        entry.is_deleted = True
        entry.deleted_at = datetime.now(timezone.utc)
        entry.deleted_by = actor.id
        await self._log(db, company_id, entry, FinanceAuditAction.deleted, actor, old_val, None)
        await db.commit()
        return {"ok": True}

    async def list_audit(self, db: AsyncSession, company_id: str, limit: int = 100):
        q = select(FinanceAuditLog).where(
            FinanceAuditLog.company_id == company_id
        ).order_by(FinanceAuditLog.created_at.desc()).limit(limit)
        rows = (await db.execute(q)).scalars().all()
        return [
            {
                "id": r.id, "action": r.action.value if hasattr(r.action, "value") else r.action,
                "kind": (r.kind.value if hasattr(r.kind, "value") else r.kind) if r.kind else None,
                "amount": r.amount, "old_value": r.old_value, "new_value": r.new_value,
                "actor_name": r.actor_name, "created_at": r.created_at,
            } for r in rows
        ]

    # ── Overview ──
    async def overview(self, db: AsyncSession, company_id: str, year: int, month: int):
        start = date(year, month, 1)
        end = date(year, month, monthrange(year, month)[1])

        ship_q = select(
            func.coalesce(func.sum(StockTransfer.total_amount), 0.0)
        ).where(
            StockTransfer.company_id == company_id,
            StockTransfer.status == TransferStatus.SHIPPED,
            func.date(StockTransfer.shipped_at) >= start,
            func.date(StockTransfer.shipped_at) <= end,
        )
        shipment_income = float((await db.execute(ship_q)).scalar() or 0.0)
        fr_ship_q = ship_q.where(StockTransfer.dest_kind == DestKind.FRANCHISE)
        franchise_shipment_income = float((await db.execute(fr_ship_q)).scalar() or 0.0)

        pay_q = select(
            func.coalesce(func.sum(Payslip.employer_cost), 0.0)
        ).join(Employee, Payslip.employee_id == Employee.id).where(
            Employee.company_id == company_id,
            Payslip.year == year,
            Payslip.month == month,
        )
        payroll_cost = float((await db.execute(pay_q)).scalar() or 0.0)

        wh_rows = (await db.execute(
            select(WarehouseStock.current_stock, WarehouseStock.unit_cost).where(
                WarehouseStock.company_id == company_id
            )
        )).all()
        warehouse_value = float(sum((cs or 0.0) * (uc or 0.0) for cs, uc in wh_rows))

        fr_count = (await db.execute(
            select(func.count(OversightLink.id)).where(
                OversightLink.brand_company_id == company_id,
                OversightLink.link_type == "franchise",
            )
        )).scalar() or 0

        cat_q = select(
            FinanceEntry.category_id, FinanceCategory.name, FinanceCategory.kind,
            func.coalesce(func.sum(FinanceEntry.amount), 0.0),
        ).join(FinanceCategory, FinanceEntry.category_id == FinanceCategory.id).where(
            FinanceEntry.company_id == company_id,
            FinanceEntry.is_deleted == False,
            FinanceEntry.entry_date >= start,
            FinanceEntry.entry_date <= end,
        ).group_by(FinanceEntry.category_id, FinanceCategory.name, FinanceCategory.kind)
        cat_rows = (await db.execute(cat_q)).all()

        income_categories, expense_categories = [], []
        manual_income, manual_expense = 0.0, 0.0
        for cid, cname, ckind, total in cat_rows:
            kval = ckind.value if hasattr(ckind, "value") else ckind
            item = {"category_id": cid, "name": cname, "kind": kval, "total": float(total)}
            if kval == "income":
                income_categories.append(item); manual_income += float(total)
            else:
                expense_categories.append(item); manual_expense += float(total)

        total_income = shipment_income + manual_income
        total_expense = payroll_cost + manual_expense

        return {
            "year": year, "month": month,
            "shipment_income": shipment_income,
            "franchise_shipment_income": franchise_shipment_income,
            "payroll_cost": payroll_cost,
            "warehouse_value": warehouse_value,
            "active_franchise_count": int(fr_count),
            "manual_income": manual_income,
            "manual_expense": manual_expense,
            "income_categories": income_categories,
            "expense_categories": expense_categories,
            "total_income": total_income,
            "total_expense": total_expense,
            "net": total_income - total_expense,
        }


finance_service = FinanceService()

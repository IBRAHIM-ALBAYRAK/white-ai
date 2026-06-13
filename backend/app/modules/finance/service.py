"""
app/modules/finance/service.py
Business logic for the Finance ledger + overview aggregation.
"""
from datetime import date
from calendar import monthrange

from fastapi import HTTPException
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.finance.models import FinanceCategory, FinanceEntry, FinanceKind
from app.modules.inventory.models import StockTransfer, WarehouseStock, DestKind, TransferStatus
from app.modules.payroll.models import Payslip
from app.modules.employees.models import Employee
from app.modules.company.models import OversightLink


class FinanceService:
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

    # ── Entries ──
    async def list_entries(self, db: AsyncSession, company_id: str,
                           year: int | None = None, month: int | None = None,
                           branch_id: str | None = None, kind: str | None = None):
        q = select(FinanceEntry, FinanceCategory.name).join(
            FinanceCategory, FinanceEntry.category_id == FinanceCategory.id
        ).where(FinanceEntry.company_id == company_id)
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
            })
        return out

    async def create_entry(self, db: AsyncSession, company_id: str, created_by: str,
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
            branch_id=branch_id, note=note, created_by=created_by,
        )
        db.add(entry)
        await db.commit()
        await db.refresh(entry)
        return entry

    async def delete_entry(self, db: AsyncSession, company_id: str, entry_id: str):
        entry = (await db.execute(
            select(FinanceEntry).where(
                FinanceEntry.id == entry_id,
                FinanceEntry.company_id == company_id,
            )
        )).scalar_one_or_none()
        if entry is None:
            raise HTTPException(status_code=404, detail="Entry not found.")
        await db.delete(entry)
        await db.commit()
        return {"ok": True}

    # ── Overview (otomatik kalemler + manuel defter) ──
    async def overview(self, db: AsyncSession, company_id: str, year: int, month: int):
        start = date(year, month, 1)
        end = date(year, month, monthrange(year, month)[1])

        # 1) Sevkiyat geliri (SHIPPED transferler, bu ay shipped_at)
        ship_q = select(
            func.coalesce(func.sum(StockTransfer.total_amount), 0.0)
        ).where(
            StockTransfer.company_id == company_id,
            StockTransfer.status == TransferStatus.SHIPPED,
            func.date(StockTransfer.shipped_at) >= start,
            func.date(StockTransfer.shipped_at) <= end,
        )
        shipment_income = float((await db.execute(ship_q)).scalar() or 0.0)

        # franchise'a sevk (gercek dis gelir)
        fr_ship_q = ship_q.where(StockTransfer.dest_kind == DestKind.FRANCHISE)
        franchise_shipment_income = float((await db.execute(fr_ship_q)).scalar() or 0.0)

        # 2) Bordro maliyeti (bu ay payslip employer_cost toplam, markaya ait calisanlar)
        pay_q = select(
            func.coalesce(func.sum(Payslip.employer_cost), 0.0)
        ).join(Employee, Payslip.employee_id == Employee.id).where(
            Employee.company_id == company_id,
            Payslip.year == year,
            Payslip.month == month,
        )
        payroll_cost = float((await db.execute(pay_q)).scalar() or 0.0)

        # 3) Depo stok degeri (current_stock * unit_cost) — anlik, donemden bagimsiz
        wh_rows = (await db.execute(
            select(WarehouseStock.current_stock, WarehouseStock.unit_cost).where(
                WarehouseStock.company_id == company_id
            )
        )).all()
        warehouse_value = float(sum((cs or 0.0) * (uc or 0.0) for cs, uc in wh_rows))

        # 4) Aktif franchise sayisi
        fr_count = (await db.execute(
            select(func.count(OversightLink.id)).where(
                OversightLink.brand_company_id == company_id,
                OversightLink.link_type == "franchise",
            )
        )).scalar() or 0

        # 5) Manuel defter — kategori bazinda toplam
        cat_q = select(
            FinanceEntry.category_id, FinanceCategory.name, FinanceCategory.kind,
            func.coalesce(func.sum(FinanceEntry.amount), 0.0),
        ).join(FinanceCategory, FinanceEntry.category_id == FinanceCategory.id).where(
            FinanceEntry.company_id == company_id,
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

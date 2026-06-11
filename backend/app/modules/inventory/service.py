"""
app/modules/inventory/service.py

Business logic for Inventory Management.

Key rules:
  - Stock cannot go negative — usage and waste are blocked if insufficient stock exists.
  - Purchase movements increase current_stock and update unit_cost to latest purchase price.
  - Usage and waste movements decrease current_stock.
  - Adjustment can be positive or negative but cannot result in negative stock.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.modules.inventory.models import Category, Supplier, Product, StockMovement, MovementType
from app.modules.inventory.schemas import (
    CategoryCreateSchema, SupplierCreateSchema,
    ProductCreateSchema, ProductUpdateSchema, StockMovementCreateSchema,
)
from app.core.exceptions import BadRequestException, NotFoundException


class InventoryService:

    # ── Categories ──────────────────────────────────────────────────────────

    async def create_category(self, db: AsyncSession, data: CategoryCreateSchema) -> Category:
        category = Category(id=str(uuid.uuid4()), branch_id=data.branch_id, name=data.name)
        db.add(category)
        await db.flush()
        return category

    async def get_categories(self, db: AsyncSession, branch_id: str) -> list[Category]:
        result = await db.execute(
            select(Category).where(Category.branch_id == branch_id, Category.is_active == True)
        )
        return result.scalars().all()

    # ── Suppliers ────────────────────────────────────────────────────────────

    async def create_supplier(self, db: AsyncSession, data: SupplierCreateSchema) -> Supplier:
        supplier = Supplier(id=str(uuid.uuid4()), **data.model_dump())
        db.add(supplier)
        await db.flush()
        return supplier

    async def get_suppliers(self, db: AsyncSession, branch_id: str) -> list[Supplier]:
        result = await db.execute(
            select(Supplier).where(Supplier.branch_id == branch_id, Supplier.is_active == True)
        )
        return result.scalars().all()

    # ── Products ─────────────────────────────────────────────────────────────

    async def create_product(self, db: AsyncSession, data: ProductCreateSchema) -> Product:
        product = Product(id=str(uuid.uuid4()), **data.model_dump())
        db.add(product)
        await db.flush()
        return product

    async def get_products(self, db: AsyncSession, branch_id: str) -> list[Product]:
        result = await db.execute(
            select(Product)
            .where(Product.branch_id == branch_id, Product.is_active == True)
            .order_by(Product.name)
        )
        return result.scalars().all()

    async def get_product(self, db: AsyncSession, product_id: str) -> Product:
        result = await db.execute(select(Product).where(Product.id == product_id))
        product = result.scalar_one_or_none()
        if not product:
            raise NotFoundException("Product not found.")
        return product

    async def update_product(self, db: AsyncSession, product_id: str, data: ProductUpdateSchema) -> Product:
        product = await self.get_product(db, product_id)
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(product, field, value)
        db.add(product)
        await db.flush()
        return product

    async def delete_product(self, db: AsyncSession, product_id: str) -> None:
        product = await self.get_product(db, product_id)
        product.is_active = False
        db.add(product)
        await db.flush()

    async def get_low_stock_products(self, db: AsyncSession, branch_id: str) -> list[Product]:
        """Return products where current_stock is at or below min_stock_level."""
        result = await db.execute(
            select(Product).where(
                Product.branch_id == branch_id,
                Product.is_active == True,
                Product.current_stock <= Product.min_stock_level,
                Product.min_stock_level > 0,
            )
        )
        return result.scalars().all()

    # ── Stock Movements ──────────────────────────────────────────────────────

    async def add_movement(self, db: AsyncSession, user_id: str, data: StockMovementCreateSchema) -> StockMovement:
        product = await self.get_product(db, data.product_id)

        if data.type in (MovementType.USAGE, MovementType.WASTE):
            if data.quantity <= 0:
                raise BadRequestException("Quantity must be positive.")
            if product.current_stock < data.quantity:
                raise BadRequestException(
                    f"Insufficient stock. Available: {product.current_stock} {product.unit}, "
                    f"Requested: {data.quantity} {product.unit}."
                )
            product.current_stock -= data.quantity

        elif data.type == MovementType.PURCHASE:
            if data.quantity <= 0:
                raise BadRequestException("Quantity must be positive.")
            product.current_stock += data.quantity
            if data.unit_cost:
                product.unit_cost = data.unit_cost

        elif data.type == MovementType.ADJUSTMENT:
            product.current_stock += data.quantity
            if product.current_stock < 0:
                raise BadRequestException("Adjustment would result in negative stock.")

        movement = StockMovement(
            id=str(uuid.uuid4()),
            product_id=data.product_id,
            branch_id=data.branch_id,
            created_by=user_id,
            type=data.type,
            quantity=data.quantity,
            unit_cost=data.unit_cost,
            notes=data.notes,
        )
        db.add(product)
        db.add(movement)
        await db.flush()
        return movement

    async def get_movements(self, db: AsyncSession, product_id: str) -> list[StockMovement]:
        result = await db.execute(
            select(StockMovement)
            .where(StockMovement.product_id == product_id)
            .order_by(StockMovement.created_at.desc())
        )
        return result.scalars().all()


inventory_service = InventoryService()


# ============================================================================
# MERKEZ DEPO + SEVK servisi — WarehouseService
# (inventory/service.py sonuna eklenecek; ayni dosyadaki import'lari kullanir
#  ama ek modeller gerekiyor — router/service eklemesinde import satiri da eklenecek)
# ============================================================================

from app.modules.inventory.models import (
    WarehouseStock, StockTransfer, TransferDirection, TransferStatus, DestKind,
)
from app.modules.company.models import Company, Branch
from app.modules.inventory.schemas import (
    WarehouseStockCreateSchema, WarehouseStockUpdateSchema, DispatchCreateSchema,
)


class WarehouseService:
    # ── Merkez depo CRUD ─────────────────────────────────────────────────────
    async def create_item(self, db: AsyncSession, company_id: str, data: WarehouseStockCreateSchema) -> WarehouseStock:
        item = WarehouseStock(
            id=str(uuid.uuid4()),
            company_id=company_id,
            name=data.name,
            unit=data.unit,
            unit_cost=data.unit_cost,
            dispatch_price=data.dispatch_price,
            current_stock=data.current_stock,
            min_stock_level=data.min_stock_level,
        )
        db.add(item)
        await db.flush()
        return item

    async def list_items(self, db: AsyncSession, company_id: str) -> list[WarehouseStock]:
        result = await db.execute(
            select(WarehouseStock).where(
                WarehouseStock.company_id == company_id,
                WarehouseStock.is_active == True,
            )
        )
        return result.scalars().all()

    async def get_item(self, db: AsyncSession, item_id: str) -> WarehouseStock:
        result = await db.execute(select(WarehouseStock).where(WarehouseStock.id == item_id))
        item = result.scalar_one_or_none()
        if not item:
            raise NotFoundException("Merkez depo ürünü bulunamadı.")
        return item

    async def update_item(self, db: AsyncSession, item_id: str, data: WarehouseStockUpdateSchema) -> WarehouseStock:
        item = await self.get_item(db, item_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(item, field, value)
        await db.flush()
        return item

    async def delete_item(self, db: AsyncSession, item_id: str) -> None:
        item = await self.get_item(db, item_id)
        item.is_active = False
        await db.flush()

    # ── Sevk (atomik) ────────────────────────────────────────────────────────
    async def dispatch(
        self, db: AsyncSession, company_id: str, requested_by: str, data: DispatchCreateSchema
    ) -> StockTransfer:
        """
        Merkezden bir subeye sevk. ATOMIK:
          1) Merkez stok yeterli mi kontrol
          2) Hedef subeyi + sirketini coz, brand_owned/franchise belirle
          3) Merkez stok dusur
          4) Hedef subede ayni isimli Product'i artir (yoksa olustur)
          5) StockTransfer kaydi (SHIPPED, bedel = qty * dispatch_price)
        Hepsi tek transaction — caller commit eder.
        """
        if data.quantity <= 0:
            raise BadRequestException("Sevk miktarı sıfırdan büyük olmalı.")

        item = await self.get_item(db, data.warehouse_stock_id)
        if item.company_id != company_id:
            raise BadRequestException("Bu merkez depo ürünü markanıza ait değil.")
        if item.current_stock < data.quantity:
            raise BadRequestException(
                f"Merkez depoda yeterli stok yok. Mevcut: {item.current_stock} {item.unit}, istenen: {data.quantity}."
            )

        # Hedef sube + sirketi
        branch_res = await db.execute(select(Branch).where(Branch.id == data.dest_branch_id))
        branch = branch_res.scalar_one_or_none()
        if not branch:
            raise NotFoundException("Hedef şube bulunamadı.")
        dest_company_id = branch.company_id

        # brand_owned mi franchise mi? Varis sirketi == marka ise kendi subesi.
        dest_kind = DestKind.BRAND_OWNED if dest_company_id == company_id else DestKind.FRANCHISE

        unit_price = item.dispatch_price or 0.0
        total = round(unit_price * data.quantity, 2)

        # 3) Merkez stok dusur
        item.current_stock = item.current_stock - data.quantity

        # 4) Hedef subede ayni isimli aktif Product var mi?
        prod_res = await db.execute(
            select(Product).where(
                Product.branch_id == data.dest_branch_id,
                Product.name == item.name,
                Product.is_active == True,
            )
        )
        product = prod_res.scalar_one_or_none()
        if product:
            product.current_stock = (product.current_stock or 0.0) + data.quantity
        else:
            product = Product(
                id=str(uuid.uuid4()),
                branch_id=data.dest_branch_id,
                name=item.name,
                unit=item.unit,
                unit_cost=unit_price,             # sube icin maliyet = sevk fiyati
                current_stock=data.quantity,
                min_stock_level=0.0,
            )
            db.add(product)

        # 5) Transfer kaydi
        transfer = StockTransfer(
            id=str(uuid.uuid4()),
            company_id=company_id,
            warehouse_stock_id=item.id,
            dest_branch_id=data.dest_branch_id,
            dest_company_id=dest_company_id,
            dest_kind=dest_kind,
            direction=TransferDirection.PUSH,
            quantity=data.quantity,
            unit_price=unit_price,
            total_amount=total,
            status=TransferStatus.SHIPPED,
            note=data.note,
            requested_by=requested_by,
            reviewed_by=requested_by,
            shipped_at=datetime.now(timezone.utc),
        )
        db.add(transfer)
        await db.flush()
        return transfer

    async def list_transfers(self, db: AsyncSession, company_id: str) -> list[StockTransfer]:
        result = await db.execute(
            select(StockTransfer)
            .where(StockTransfer.company_id == company_id)
            .order_by(StockTransfer.created_at.desc())
        )
        return result.scalars().all()


warehouse_service = WarehouseService()

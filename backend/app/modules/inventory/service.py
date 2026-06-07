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
"""
app/modules/inventory/router.py

Inventory management endpoints. Locked to staff (superadmin, owner, manager);
employees have no access.

Tenant isolation: every endpoint is scoped to a branch the caller can access.
  - Branch-based reads/creates: assert_branch_access(branch_id)
  - Single product/movement endpoints: _assert_product resolves the product's
    branch, then assert_branch_access.
A user can only touch inventory belonging to companies they can access
(own company, or — if their company is a brand — its oversight-linked subs).
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import require_role, assert_branch_access
from app.modules.auth.models import User, UserRole
from app.modules.inventory.schemas import (
    CategoryCreateSchema, CategoryResponseSchema,
    SupplierCreateSchema, SupplierResponseSchema,
    ProductCreateSchema, ProductUpdateSchema, ProductResponseSchema,
    StockMovementCreateSchema, StockMovementResponseSchema,
)
from app.modules.inventory.service import inventory_service

router = APIRouter(prefix="/inventory", tags=["Inventory"])

staff = require_role(UserRole.SUPERADMIN, UserRole.OWNER, UserRole.MANAGER)


async def _assert_product(db: AsyncSession, current_user: User, product_id: str) -> None:
    """Resolve a product's branch and assert the caller can access that branch."""
    product = await inventory_service.get_product(db, product_id)
    await assert_branch_access(db, current_user, product.branch_id)


# ── Categories ──
@router.post("/categories", response_model=CategoryResponseSchema)
async def create_category(data: CategoryCreateSchema, db: AsyncSession = Depends(get_db), current_user: User = Depends(staff)):
    await assert_branch_access(db, current_user, data.branch_id)
    return await inventory_service.create_category(db, data)

@router.get("/categories/branch/{branch_id}", response_model=list[CategoryResponseSchema])
async def list_categories(branch_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(staff)):
    await assert_branch_access(db, current_user, branch_id)
    return await inventory_service.get_categories(db, branch_id)


# ── Suppliers ──
@router.post("/suppliers", response_model=SupplierResponseSchema)
async def create_supplier(data: SupplierCreateSchema, db: AsyncSession = Depends(get_db), current_user: User = Depends(staff)):
    await assert_branch_access(db, current_user, data.branch_id)
    return await inventory_service.create_supplier(db, data)

@router.get("/suppliers/branch/{branch_id}", response_model=list[SupplierResponseSchema])
async def list_suppliers(branch_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(staff)):
    await assert_branch_access(db, current_user, branch_id)
    return await inventory_service.get_suppliers(db, branch_id)


# ── Products ──
@router.post("/products", response_model=ProductResponseSchema)
async def create_product(data: ProductCreateSchema, db: AsyncSession = Depends(get_db), current_user: User = Depends(staff)):
    await assert_branch_access(db, current_user, data.branch_id)
    return await inventory_service.create_product(db, data)

@router.get("/products/branch/{branch_id}", response_model=list[ProductResponseSchema])
async def list_products(branch_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(staff)):
    await assert_branch_access(db, current_user, branch_id)
    return await inventory_service.get_products(db, branch_id)

@router.get("/products/branch/{branch_id}/low", response_model=list[ProductResponseSchema])
async def low_stock_products(branch_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(staff)):
    await assert_branch_access(db, current_user, branch_id)
    return await inventory_service.get_low_stock_products(db, branch_id)

@router.get("/products/{product_id}", response_model=ProductResponseSchema)
async def get_product(product_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(staff)):
    await _assert_product(db, current_user, product_id)
    return await inventory_service.get_product(db, product_id)

@router.put("/products/{product_id}", response_model=ProductResponseSchema)
async def update_product(product_id: str, data: ProductUpdateSchema, db: AsyncSession = Depends(get_db), current_user: User = Depends(staff)):
    await _assert_product(db, current_user, product_id)
    return await inventory_service.update_product(db, product_id, data)

@router.delete("/products/{product_id}")
async def delete_product(product_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(staff)):
    await _assert_product(db, current_user, product_id)
    await inventory_service.delete_product(db, product_id)
    return {"message": "Product deleted."}


# ── Stock Movements ──
@router.post("/movements", response_model=StockMovementResponseSchema)
async def add_movement(data: StockMovementCreateSchema, db: AsyncSession = Depends(get_db), current_user: User = Depends(staff)):
    await assert_branch_access(db, current_user, data.branch_id)
    return await inventory_service.add_movement(db, current_user.id, data)

@router.get("/movements/{product_id}", response_model=list[StockMovementResponseSchema])
async def list_movements(product_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(staff)):
    await _assert_product(db, current_user, product_id)
    return await inventory_service.get_movements(db, product_id)
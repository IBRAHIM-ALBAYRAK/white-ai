"""
app/modules/inventory/router.py

API endpoints for Inventory Management.
All routes are protected — only authenticated users can access them.

Endpoints:
  POST   /inventory/categories                      — Create a category
  GET    /inventory/categories/branch/{branch_id}   — List categories for a branch
  POST   /inventory/suppliers                       — Create a supplier
  GET    /inventory/suppliers/branch/{branch_id}    — List suppliers for a branch
  POST   /inventory/products                        — Create a product
  GET    /inventory/products/branch/{branch_id}     — List all products for a branch
  GET    /inventory/products/branch/{branch_id}/low — List low stock products
  GET    /inventory/products/{product_id}           — Get a single product
  PUT    /inventory/products/{product_id}           — Update a product
  DELETE /inventory/products/{product_id}           — Soft delete a product
  POST   /inventory/movements                       — Add a stock movement
  GET    /inventory/movements/{product_id}          — List movements for a product
"""

from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedException
from app.modules.inventory.schemas import (
    CategoryCreateSchema, CategoryResponseSchema,
    SupplierCreateSchema, SupplierResponseSchema,
    ProductCreateSchema, ProductUpdateSchema, ProductResponseSchema,
    StockMovementCreateSchema, StockMovementResponseSchema,
)
from app.modules.inventory.service import inventory_service

router = APIRouter(prefix="/inventory", tags=["Inventory"])
security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = decode_token(credentials.credentials)
    if not payload:
        raise UnauthorizedException("Invalid or expired token.")
    return payload


# ── Categories ──────────────────────────────────────────────────────────────

@router.post("/categories", response_model=CategoryResponseSchema)
async def create_category(
    data: CategoryCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await inventory_service.create_category(db, data)

@router.get("/categories/branch/{branch_id}", response_model=list[CategoryResponseSchema])
async def list_categories(
    branch_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await inventory_service.get_categories(db, branch_id)


# ── Suppliers ────────────────────────────────────────────────────────────────

@router.post("/suppliers", response_model=SupplierResponseSchema)
async def create_supplier(
    data: SupplierCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await inventory_service.create_supplier(db, data)

@router.get("/suppliers/branch/{branch_id}", response_model=list[SupplierResponseSchema])
async def list_suppliers(
    branch_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await inventory_service.get_suppliers(db, branch_id)


# ── Products ─────────────────────────────────────────────────────────────────

@router.post("/products", response_model=ProductResponseSchema)
async def create_product(
    data: ProductCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await inventory_service.create_product(db, data)

@router.get("/products/branch/{branch_id}", response_model=list[ProductResponseSchema])
async def list_products(
    branch_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await inventory_service.get_products(db, branch_id)

@router.get("/products/branch/{branch_id}/low", response_model=list[ProductResponseSchema])
async def low_stock_products(
    branch_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await inventory_service.get_low_stock_products(db, branch_id)

@router.get("/products/{product_id}", response_model=ProductResponseSchema)
async def get_product(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await inventory_service.get_product(db, product_id)

@router.put("/products/{product_id}", response_model=ProductResponseSchema)
async def update_product(
    product_id: str,
    data: ProductUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await inventory_service.update_product(db, product_id, data)

@router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    await inventory_service.delete_product(db, product_id)
    return {"message": "Product deleted."}


# ── Stock Movements ──────────────────────────────────────────────────────────

@router.post("/movements", response_model=StockMovementResponseSchema)
async def add_movement(
    data: StockMovementCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await inventory_service.add_movement(db, current_user["sub"], data)

@router.get("/movements/{product_id}", response_model=list[StockMovementResponseSchema])
async def list_movements(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await inventory_service.get_movements(db, product_id)
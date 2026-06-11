"""
app/modules/inventory/router.py
 
Inventory management endpoints. Locked to staff (superadmin, owner, manager);
employees have no access.
 
Tenant isolation + franchise oversight:
  - Reads + daily stock movements: assert_branch_access (a franchise manages its
    own day-to-day stock freely).
  - STRUCTURAL changes (create/update/delete product, create category/supplier):
    assert_structural_inventory_access — a FRANCHISE sub-owner is blocked (403)
    and must use the change-request flow; brand/standalone/full-branch are allowed.
"""
 
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import require_role, assert_branch_access, assert_structural_inventory_access
from app.modules.auth.models import User, UserRole
from app.modules.inventory.schemas import (
    CategoryCreateSchema, CategoryResponseSchema,
    SupplierCreateSchema, SupplierResponseSchema,
    ProductCreateSchema, ProductUpdateSchema, ProductResponseSchema,
    StockMovementCreateSchema, StockMovementResponseSchema,
)
from app.modules.inventory.service import inventory_service, warehouse_service
from app.modules.inventory.schemas import (
    WarehouseStockCreateSchema, WarehouseStockUpdateSchema,
    WarehouseStockResponseSchema, DispatchCreateSchema, TransferResponseSchema,
)
from app.core.deps import get_current_user
 
router = APIRouter(prefix="/inventory", tags=["Inventory"])
 
staff = require_role(UserRole.SUPERADMIN, UserRole.OWNER, UserRole.MANAGER)
 
 
async def _assert_product(db: AsyncSession, current_user: User, product_id: str) -> None:
    """READ access: resolve a product's branch and assert branch access."""
    product = await inventory_service.get_product(db, product_id)
    await assert_branch_access(db, current_user, product.branch_id)
 
 
async def _assert_product_structural(db: AsyncSession, current_user: User, product_id: str) -> None:
    """STRUCTURAL write access: resolve product's branch, apply franchise rule."""
    product = await inventory_service.get_product(db, product_id)
    await assert_structural_inventory_access(db, current_user, product.branch_id)
 
 
# ── Categories ──
@router.post("/categories", response_model=CategoryResponseSchema)
async def create_category(data: CategoryCreateSchema, db: AsyncSession = Depends(get_db), current_user: User = Depends(staff)):
    await assert_structural_inventory_access(db, current_user, data.branch_id)
    cat = await inventory_service.create_category(db, data)
    await db.commit()
    await db.refresh(cat)
    return cat
 
@router.get("/categories/branch/{branch_id}", response_model=list[CategoryResponseSchema])
async def list_categories(branch_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(staff)):
    await assert_branch_access(db, current_user, branch_id)
    return await inventory_service.get_categories(db, branch_id)

@router.delete("/categories/{category_id}")
async def delete_category(category_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(staff)):
    await inventory_service.delete_category(db, category_id)
    await db.commit()
    return {"ok": True}
 
 
# ── Suppliers ──
@router.post("/suppliers", response_model=SupplierResponseSchema)
async def create_supplier(data: SupplierCreateSchema, db: AsyncSession = Depends(get_db), current_user: User = Depends(staff)):
    await assert_structural_inventory_access(db, current_user, data.branch_id)
    return await inventory_service.create_supplier(db, data)
 
@router.get("/suppliers/branch/{branch_id}", response_model=list[SupplierResponseSchema])
async def list_suppliers(branch_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(staff)):
    await assert_branch_access(db, current_user, branch_id)
    return await inventory_service.get_suppliers(db, branch_id)
 
 
# ── Products ──
@router.post("/products", response_model=ProductResponseSchema)
async def create_product(data: ProductCreateSchema, db: AsyncSession = Depends(get_db), current_user: User = Depends(staff)):
    await assert_structural_inventory_access(db, current_user, data.branch_id)
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
    await _assert_product_structural(db, current_user, product_id)
    return await inventory_service.update_product(db, product_id, data)
 
@router.delete("/products/{product_id}")
async def delete_product(product_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(staff)):
    await _assert_product_structural(db, current_user, product_id)
    await inventory_service.delete_product(db, product_id)
    return {"message": "Product deleted."}
 
 
# ── Stock Movements (daily ops — franchise free) ──
@router.post("/movements", response_model=StockMovementResponseSchema)
async def add_movement(data: StockMovementCreateSchema, db: AsyncSession = Depends(get_db), current_user: User = Depends(staff)):
    await assert_branch_access(db, current_user, data.branch_id)
    return await inventory_service.add_movement(db, current_user.id, data)
 
@router.get("/movements/{product_id}", response_model=list[StockMovementResponseSchema])
async def list_movements(product_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(staff)):
    await _assert_product(db, current_user, product_id)
    return await inventory_service.get_movements(db, product_id)
 


# ============================================================================
# MERKEZ DEPO + SEVK endpoint'leri
# Sadece marka sahibi (owner) erisebilir — merkez depo markanin, manager degil.
# router.py'ye eklenecek. Gerekli ek import'lar dosya basina da eklenecek:
#   from app.modules.inventory.schemas import (
#       WarehouseStockCreateSchema, WarehouseStockUpdateSchema,
#       WarehouseStockResponseSchema, DispatchCreateSchema, TransferResponseSchema,
#   )
#   from app.modules.inventory.service import warehouse_service
#   from app.core.deps import get_current_user
# ============================================================================

warehouse_owner = require_role(UserRole.SUPERADMIN, UserRole.OWNER)


@router.post("/warehouse/items", response_model=WarehouseStockResponseSchema)
async def create_warehouse_item(
    data: WarehouseStockCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(warehouse_owner),
):
    """Merkez depoya yeni ürün ekle (markaya bağlı)."""
    item = await warehouse_service.create_item(db, current_user.company_id, data)
    await db.commit()
    await db.refresh(item)
    return item


@router.get("/warehouse/items", response_model=list[WarehouseStockResponseSchema])
async def list_warehouse_items(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(warehouse_owner),
):
    """Markanın merkez depo stoğunu listele."""
    return await warehouse_service.list_items(db, current_user.company_id)


@router.put("/warehouse/items/{item_id}", response_model=WarehouseStockResponseSchema)
async def update_warehouse_item(
    item_id: str,
    data: WarehouseStockUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(warehouse_owner),
):
    """Merkez depo ürününü güncelle (fiyat, stok, min seviye)."""
    item = await warehouse_service.get_item(db, item_id)
    if item.company_id != current_user.company_id:
        from app.core.exceptions import ForbiddenException
        raise ForbiddenException("Bu ürün markanıza ait değil.")
    updated = await warehouse_service.update_item(db, item_id, data)
    await db.commit()
    await db.refresh(updated)
    return updated


@router.delete("/warehouse/items/{item_id}")
async def delete_warehouse_item(
    item_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(warehouse_owner),
):
    """Merkez depo ürününü pasifleştir (soft delete)."""
    item = await warehouse_service.get_item(db, item_id)
    if item.company_id != current_user.company_id:
        from app.core.exceptions import ForbiddenException
        raise ForbiddenException("Bu ürün markanıza ait değil.")
    await warehouse_service.delete_item(db, item_id)
    await db.commit()
    return {"message": "Merkez depo ürünü kaldırıldı."}


@router.post("/warehouse/dispatch", response_model=TransferResponseSchema)
async def dispatch_stock(
    data: DispatchCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(warehouse_owner),
):
    """
    Merkez depodan bir şubeye/franchise'a sevk et. Atomik:
    merkez stok düşer, hedef şube stoğu artar, bedel kaydı oluşur.
    """
    transfer = await warehouse_service.dispatch(
        db, current_user.company_id, current_user.id, data
    )
    await db.commit()
    await db.refresh(transfer)
    return transfer


@router.get("/warehouse/transfers", response_model=list[TransferResponseSchema])
async def list_transfers(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(warehouse_owner),
):
    """Markanın tüm sevkiyat kayıtları (en yeni önce)."""
    return await warehouse_service.list_transfers(db, current_user.company_id)

"""
app/modules/inventory/models.py

Database models for Inventory Management.

Tables:
  - inventory_categories     : Product categories (Beverages, Food, Packaging, etc.)
  - inventory_suppliers      : Supplier contact and company information
  - inventory_products       : Stock items with unit, cost, and reorder thresholds
  - inventory_stock_movements: Every stock change — purchase, usage, waste, adjustment
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Enum as SAEnum, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class MovementType(str, enum.Enum):
    PURCHASE   = "purchase"    # Tedarikçiden stok girişi
    USAGE      = "usage"       # Kullanım / servis
    WASTE      = "waste"       # Fire / bozulma
    ADJUSTMENT = "adjustment"  # Manuel düzeltme


class Category(Base):
    __tablename__ = "inventory_categories"

    id         = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    branch_id  = Column(String, ForeignKey("branches.id"), nullable=False)
    name       = Column(String, nullable=False)
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    products   = relationship("Product", back_populates="category", lazy="select")


class Supplier(Base):
    __tablename__ = "inventory_suppliers"

    id         = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    branch_id  = Column(String, ForeignKey("branches.id"), nullable=False)
    name       = Column(String, nullable=False)
    contact    = Column(String, nullable=True)
    phone      = Column(String, nullable=True)
    email      = Column(String, nullable=True)
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    products   = relationship("Product", back_populates="supplier", lazy="select")


class Product(Base):
    __tablename__ = "inventory_products"

    id              = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    branch_id       = Column(String, ForeignKey("branches.id"), nullable=False)
    category_id     = Column(String, ForeignKey("inventory_categories.id"), nullable=True)
    supplier_id     = Column(String, ForeignKey("inventory_suppliers.id"), nullable=True)
    name            = Column(String, nullable=False)
    unit            = Column(String, nullable=False)      # kg, litre, adet, kutu
    unit_cost       = Column(Float, default=0.0)          # TL cinsinden
    current_stock   = Column(Float, default=0.0)
    min_stock_level = Column(Float, default=0.0)          # Bu seviyenin altı = uyarı
    is_active       = Column(Boolean, default=True)
    created_at      = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at      = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    category  = relationship("Category", back_populates="products")
    supplier  = relationship("Supplier", back_populates="products")
    movements = relationship("StockMovement", back_populates="product", lazy="select")


class StockMovement(Base):
    __tablename__ = "inventory_stock_movements"

    id         = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String, ForeignKey("inventory_products.id"), nullable=False)
    branch_id  = Column(String, ForeignKey("branches.id"), nullable=False)
    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    type       = Column(SAEnum(MovementType), nullable=False)
    quantity   = Column(Float, nullable=False)
    unit_cost  = Column(Float, nullable=True)   # Sadece purchase'da dolu
    notes      = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    product = relationship("Product", back_populates="movements")


class ChangeAction(str, enum.Enum):
    CREATE = "create"   # Yeni ürün ekleme talebi
    UPDATE = "update"   # Mevcut ürün güncelleme talebi
    DELETE = "delete"   # Ürün silme talebi


class ChangeStatus(str, enum.Enum):
    PENDING  = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class InventoryChangeRequest(Base):
    """
    Franchise sub-owner'ın yapısal envanter değişikliği (ürün ekle/güncelle/sil)
    talebi. Brand-owner onaylar/reddeder. Onaylanınca sistem değişikliği otomatik
    uygular. Günlük stok hareketleri bu akıştan GEÇMEZ (onlar serbest).
    """
    __tablename__ = "inventory_change_requests"

    id                = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id        = Column(String, ForeignKey("companies.id"), nullable=False)   # Talebi açan franchise
    branch_id         = Column(String, ForeignKey("branches.id"), nullable=False)    # Hangi şube
    requested_by      = Column(String, ForeignKey("users.id"), nullable=False)       # Talep eden franchise user
    action            = Column(SAEnum(ChangeAction), nullable=False)
    target_product_id = Column(String, ForeignKey("inventory_products.id"), nullable=True)  # update/delete için
    payload           = Column(JSON, nullable=True)   # create: yeni ürün bilgisi; update: değişen alanlar
    status            = Column(SAEnum(ChangeStatus), nullable=False, default=ChangeStatus.PENDING)
    reviewed_by       = Column(String, ForeignKey("users.id"), nullable=True)        # Onaylayan/reddeden brand user
    review_note       = Column(String, nullable=True)
    created_at        = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    reviewed_at       = Column(DateTime(timezone=True), nullable=True)


# ============================================================================
# MERKEZ DEPO (Central Warehouse) + SEVK/TRANSFER
# Merkez depo = markanin ana stok havuzu. Subelerden BAGIMSIZ (branch_id YOK,
# dogrudan company_id'ye = markaya bagli). Buradan subelere/franchise'lara sevk.
# ============================================================================


class WarehouseStock(Base):
    """
    Markanin merkez depo stogu. Her kayit bir urunun ana havuzdaki miktari.
    branch'e degil, dogrudan markaya (company) baglidir.
    dispatch_price = subeye/franchise'a sevk edilirken uygulanan birim satis fiyati.
    """
    __tablename__ = "warehouse_stock"

    id              = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id      = Column(String, ForeignKey("companies.id"), nullable=False)  # Marka
    name            = Column(String, nullable=False)
    unit            = Column(String, nullable=False)      # kg, litre, adet, kutu
    unit_cost       = Column(Float, default=0.0)          # Markanin alis maliyeti (TL)
    dispatch_price  = Column(Float, default=0.0)          # Subeye/franchise'a sevk birim fiyati (TL)
    current_stock   = Column(Float, default=0.0)
    min_stock_level = Column(Float, default=0.0)          # Bu seviyenin alti = azaliyor uyarisi
    is_active       = Column(Boolean, default=True)
    created_at      = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at      = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    transfers = relationship("StockTransfer", back_populates="warehouse_stock", lazy="select")


class TransferDirection(str, enum.Enum):
    PUSH = "push"   # Merkez itti (marka gonderdi)
    PULL = "pull"   # Sube talep etti


class TransferStatus(str, enum.Enum):
    PENDING   = "pending"    # Talep acildi (pull) — onay bekliyor
    APPROVED  = "approved"   # Onaylandi, sevke hazir
    SHIPPED   = "shipped"    # Sevk edildi (stok hareketi uygulandi)
    RECEIVED  = "received"   # Sube teslim aldi
    REJECTED  = "rejected"   # Reddedildi


class DestKind(str, enum.Enum):
    BRAND_OWNED = "brand_owned"  # Markaya ait sube (ic satis)
    FRANCHISE   = "franchise"    # Franchise (gercek satis = marka geliri)


class StockTransfer(Base):
    """
    Merkez depodan bir subeye/franchise'a sevk veya subenin talebi kaydi.
    SHIPPED olunca atomik hareket uygulanir: merkez stok dusulur, varis subesinde
    ilgili Product artirilir (yoksa olusturulur), bedel kaydi tutulur.
    """
    __tablename__ = "stock_transfers"

    id                 = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id         = Column(String, ForeignKey("companies.id"), nullable=False)        # Marka
    warehouse_stock_id = Column(String, ForeignKey("warehouse_stock.id"), nullable=False)  # Hangi merkez urunu
    dest_branch_id     = Column(String, ForeignKey("branches.id"), nullable=False)         # Varis subesi
    dest_company_id    = Column(String, ForeignKey("companies.id"), nullable=False)        # Varis subesinin sirketi (franchise ayri company)
    dest_kind          = Column(SAEnum(DestKind), nullable=False)
    direction          = Column(SAEnum(TransferDirection), nullable=False)
    quantity           = Column(Float, nullable=False)
    unit_price         = Column(Float, nullable=False, default=0.0)   # Sevk anindaki dispatch_price (kopya)
    total_amount       = Column(Float, nullable=False, default=0.0)   # quantity * unit_price
    status             = Column(SAEnum(TransferStatus), nullable=False, default=TransferStatus.PENDING)
    note               = Column(String, nullable=True)
    requested_by       = Column(String, ForeignKey("users.id"), nullable=False)
    reviewed_by        = Column(String, ForeignKey("users.id"), nullable=True)
    created_at         = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    shipped_at         = Column(DateTime(timezone=True), nullable=True)

    warehouse_stock = relationship("WarehouseStock", back_populates="transfers")

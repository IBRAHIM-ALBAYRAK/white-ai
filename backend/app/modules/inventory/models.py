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
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Enum as SAEnum
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
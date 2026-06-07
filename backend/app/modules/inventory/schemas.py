"""
app/modules/inventory/schemas.py

Pydantic schemas for request validation and response serialization.

Covers:
  - Category   : create and response
  - Supplier   : create and response
  - Product    : create, update, and response
  - StockMovement: create and response
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.modules.inventory.models import MovementType


# --- Category ---

class CategoryCreateSchema(BaseModel):
    branch_id: str
    name: str

class CategoryResponseSchema(BaseModel):
    id: str
    branch_id: str
    name: str
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}


# --- Supplier ---

class SupplierCreateSchema(BaseModel):
    branch_id: str
    name: str
    contact: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

class SupplierResponseSchema(BaseModel):
    id: str
    branch_id: str
    name: str
    contact: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}


# --- Product ---

class ProductCreateSchema(BaseModel):
    branch_id: str
    name: str
    unit: str
    unit_cost: float = 0.0
    current_stock: float = 0.0
    min_stock_level: float = 0.0
    category_id: Optional[str] = None
    supplier_id: Optional[str] = None

class ProductUpdateSchema(BaseModel):
    name: Optional[str] = None
    unit: Optional[str] = None
    unit_cost: Optional[float] = None
    min_stock_level: Optional[float] = None
    category_id: Optional[str] = None
    supplier_id: Optional[str] = None

class ProductResponseSchema(BaseModel):
    id: str
    branch_id: str
    name: str
    unit: str
    unit_cost: float
    current_stock: float
    min_stock_level: float
    is_active: bool
    category_id: Optional[str]
    supplier_id: Optional[str]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


# --- Stock Movement ---

class StockMovementCreateSchema(BaseModel):
    product_id: str
    branch_id: str
    type: MovementType
    quantity: float
    unit_cost: Optional[float] = None
    notes: Optional[str] = None

class StockMovementResponseSchema(BaseModel):
    id: str
    product_id: str
    branch_id: str
    created_by: str
    type: MovementType
    quantity: float
    unit_cost: Optional[float]
    notes: Optional[str]
    created_at: datetime
    model_config = {"from_attributes": True}
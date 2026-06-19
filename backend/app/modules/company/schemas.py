"""
app/modules/company/schemas.py

Defines the API request and response shapes for Company and Branch.

Schemas serve two purposes:
  - Incoming requests: validate that required fields are present and correctly typed.
    If a required field is missing or has the wrong type, FastAPI automatically
    rejects the request before it reaches the business logic.
  - Outgoing responses: control exactly what data is sent back to the frontend.
    Sensitive or unnecessary fields from the database model are excluded here.

Company schemas handle multi-tenant onboarding — each new business on WHITE.AI
starts with a Company record. Branch schemas handle individual locations under
that company. Every workforce, inventory, and timeclock record will reference
a branch_id that originates here.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# --- Company Schemas ---

class CompanyCreateSchema(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None

class CompanyUpdateSchema(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    legal_type: Optional[str] = None
    is_active: Optional[bool] = None

class CompanyResponseSchema(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str]
    address: Optional[str]
    company_type: str
    legal_type: str = "limited"
    legal_name: Optional[str] = None
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}

# --- Branch Schemas ---

class BranchCreateSchema(BaseModel):
    name: str
    company_id: str
    address: Optional[str] = None
    phone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class BranchUpdateSchema(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_active: Optional[bool] = None

class BranchResponseSchema(BaseModel):
    id: str
    company_id: str
    name: str
    address: Optional[str]
    phone: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
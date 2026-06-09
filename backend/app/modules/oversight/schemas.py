"""
app/modules/oversight/schemas.py

Schemas for brand → sub-company (franchise) management.
A brand creates sub-companies and links them via oversight_links with a chosen
link_type ("full" = brand's own branch, full control incl. payroll; "franchise"
= separate legal entity, payroll hidden, advice-only on staff/shifts).
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr


class SubCreateSchema(BaseModel):
    """Brand creates a new sub-company and links it under itself."""
    name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    link_type: str = "franchise"   # "full" | "franchise"


class SubResponseSchema(BaseModel):
    """A sub-company as seen from the brand, including the link type."""
    id: str
    name: str
    email: str
    phone: Optional[str]
    address: Optional[str]
    company_type: str
    is_active: bool
    link_type: str
    created_at: datetime
    model_config = {"from_attributes": True}

"""
app/modules/users/schemas.py

Pydantic schemas for User management.

Covers:
  - EmployeeCreateSchema : Manager creates a new employee account
  - UserUpdateSchema     : Update user profile fields
  - UserResponseSchema   : Standard user response
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class EmployeeCreateSchema(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    company_id: Optional[str] = None
    branch_id: Optional[str] = None
    role: str = "employee"


class UserUpdateSchema(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    branch_id: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponseSchema(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    phone: Optional[str]
    role: str
    company_id: Optional[str]
    branch_id: Optional[str]
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}
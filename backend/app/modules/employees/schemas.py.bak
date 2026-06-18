"""
app/modules/employees/schemas.py

Pydantic schemas for Employee module.

Covers:
  - EmployeeCreateSchema  : Create new employee (with optional system access)
  - EmployeeUpdateSchema  : Update employee profile fields
  - EmployeeResponseSchema: Standard response
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date
from app.modules.employees.models import ContractType


# --- Create ---

class EmployeeCreateSchema(BaseModel):
    # Org
    company_id: str
    branch_id: Optional[str] = None

    # Personal
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    tc_no: Optional[str] = None
    sgk_no: Optional[str] = None

    # Employment
    hire_date: Optional[date] = None
    contract_type: ContractType = ContractType.FULL_TIME
    position: Optional[str] = None
    department: Optional[str] = None

    # Payroll
    base_salary: Optional[float] = None
    bank_iban: Optional[str] = None

    # System access (optional — employee can exist without login)
    create_user_account: bool = False
    password: Optional[str] = None
    role: str = "employee"


# --- Update ---

class EmployeeUpdateSchema(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    tc_no: Optional[str] = None
    sgk_no: Optional[str] = None
    hire_date: Optional[date] = None
    contract_type: Optional[ContractType] = None
    position: Optional[str] = None
    department: Optional[str] = None
    base_salary: Optional[float] = None
    bank_iban: Optional[str] = None
    branch_id: Optional[str] = None
    is_active: Optional[bool] = None
    termination_date: Optional[date] = None


# --- Response ---

class EmployeeResponseSchema(BaseModel):
    id: str
    user_id: Optional[str]
    company_id: str
    branch_id: Optional[str]
    first_name: str
    last_name: str
    email: Optional[str]
    phone: Optional[str]
    tc_no: Optional[str]
    sgk_no: Optional[str]
    hire_date: Optional[date]
    contract_type: ContractType
    position: Optional[str]
    department: Optional[str]
    base_salary: Optional[float]
    bank_iban: Optional[str]
    is_active: bool
    termination_date: Optional[date]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}
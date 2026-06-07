"""
app/modules/employees/models.py

Employee profile — separate from auth (User).

Key design decisions:
  - User  → authentication only (email, password, role)
  - Employee → workforce identity (name, TC, SGK, salary, contract)
  - One User can have one Employee profile per company
  - Deleting an employee does NOT delete the user account
  - Historical data (timeclock, payroll) is preserved via employee_id FK
  - is_active = False means offboarded, not deleted
"""

import uuid
import enum
from datetime import datetime, timezone, date
from sqlalchemy import (
    Column, String, Boolean, DateTime, Date,
    Numeric, ForeignKey, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class ContractType(str, enum.Enum):
    FULL_TIME  = "full_time"
    PART_TIME  = "part_time"
    TEMPORARY  = "temporary"
    INTERN     = "intern"


class Employee(Base):
    __tablename__ = "employees"

    id            = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Auth link — nullable because employee can exist without system access
    user_id       = Column(String, ForeignKey("users.id"), nullable=True, unique=True)

    # Org structure
    company_id    = Column(String, ForeignKey("companies.id"), nullable=False)
    branch_id     = Column(String, ForeignKey("branches.id"), nullable=True)

    # Personal info
    first_name    = Column(String, nullable=False)
    last_name     = Column(String, nullable=False)
    email         = Column(String, nullable=True, unique=True)
    phone         = Column(String, nullable=True)
    tc_no         = Column(String, nullable=True)   # Turkish ID number
    sgk_no        = Column(String, nullable=True)   # Social security number

    # Employment info
    hire_date     = Column(Date, nullable=True)
    contract_type = Column(SAEnum(ContractType), default=ContractType.FULL_TIME, nullable=False)
    position      = Column(String, nullable=True)   # Job title e.g. "Barista"
    department    = Column(String, nullable=True)   # e.g. "Kitchen", "Service"

    # Payroll
    base_salary   = Column(Numeric(12, 2), nullable=True)  # Monthly gross in TRY
    bank_iban     = Column(String, nullable=True)

    # Status
    is_active     = Column(Boolean, default=True, nullable=False)
    termination_date = Column(Date, nullable=True)


    # Timestamps
    created_at    = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at    = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
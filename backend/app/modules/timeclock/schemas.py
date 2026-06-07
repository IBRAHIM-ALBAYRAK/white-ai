"""
app/modules/timeclock/schemas.py

Pydantic schemas for request validation and response serialization.

Covers:
  - TimeRecord: check-in, check-out, manual adjustment, and response
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.modules.timeclock.models import RecordStatus


# --- Check In ---

class CheckInSchema(BaseModel):
    branch_id: str
    employee_id: str
    checked_in_at: Optional[datetime] = None  # Defaults to now if not provided
    is_late: Optional[bool] = False


# --- Check Out ---

class CheckOutSchema(BaseModel):
    checked_out_at: Optional[datetime] = None  # Defaults to now if not provided


# --- Manual Adjustment ---

class AdjustRecordSchema(BaseModel):
    checked_in_at: Optional[datetime] = None
    checked_out_at: Optional[datetime] = None
    status: Optional[RecordStatus] = None
    notes: Optional[str] = None
    is_late: Optional[bool] = None


# --- Response ---

class TimeRecordResponseSchema(BaseModel):
    id: str
    branch_id: str
    employee_id: str
    checked_in_at: datetime
    checked_out_at: Optional[datetime]
    total_minutes: Optional[int]
    status: RecordStatus
    notes: Optional[str]
    is_late: bool
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}
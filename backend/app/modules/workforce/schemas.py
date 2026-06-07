"""
app/modules/workforce/schemas.py

Defines the API request and response shapes for Shift and ShiftAssignment.

ShiftCreateSchema: manager creates a shift for a branch with a time range.
ShiftAssignSchema: manager assigns one or more employees to a shift.
AssignmentUpdateSchema: employee confirms or rejects their assigned shift.
ShiftResponseSchema: full shift data returned to frontend including assignments.
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.modules.workforce.models import ShiftStatus, AssignmentStatus


# --- Shift Schemas ---

class ShiftCreateSchema(BaseModel):
    branch_id: str
    title: str
    start_time: datetime
    end_time: datetime
    notes: Optional[str] = None

class ShiftUpdateSchema(BaseModel):
    title: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[ShiftStatus] = None
    notes: Optional[str] = None

class ShiftAssignSchema(BaseModel):
    employee_ids: list[str]

class AssignmentUpdateSchema(BaseModel):
    status: AssignmentStatus

# --- Response Schemas ---

class AssignmentResponseSchema(BaseModel):
    id: str
    shift_id: str
    employee_id: str
    status: AssignmentStatus
    created_at: datetime

    model_config = {"from_attributes": True}

class ShiftResponseSchema(BaseModel):
    id: str
    branch_id: str
    created_by: str
    title: str
    start_time: datetime
    end_time: datetime
    status: ShiftStatus
    notes: Optional[str]
    created_at: datetime
    assignments: list[AssignmentResponseSchema] = []

    model_config = {"from_attributes": True}
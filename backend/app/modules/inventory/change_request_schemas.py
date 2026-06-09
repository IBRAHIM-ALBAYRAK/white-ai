"""
app/modules/inventory/change_request_schemas.py

Schemas for the franchise inventory change-request approval flow.
A franchise sub-owner cannot directly perform structural inventory changes
(add product, edit thresholds, delete). Instead they submit a change request;
the brand-owner approves (auto-applied) or rejects it.
"""

from typing import Optional, Any
from datetime import datetime
from pydantic import BaseModel


class ChangeRequestCreateSchema(BaseModel):
    """
    Franchise submits a structural-change request.
      action = "create" -> payload holds the new product fields (ProductCreateSchema shape)
      action = "update" -> target_product_id set; payload holds changed fields
      action = "delete" -> target_product_id set; payload ignored
    """
    branch_id: str
    action: str                              # "create" | "update" | "delete"
    target_product_id: Optional[str] = None  # required for update/delete
    payload: Optional[dict[str, Any]] = None # product fields for create/update


class ChangeRequestReviewSchema(BaseModel):
    """Brand approves or rejects. note is optional."""
    note: Optional[str] = None


class ChangeRequestResponseSchema(BaseModel):
    id: str
    company_id: str
    branch_id: str
    requested_by: str
    action: str
    target_product_id: Optional[str]
    payload: Optional[dict[str, Any]]
    status: str
    reviewed_by: Optional[str]
    review_note: Optional[str]
    created_at: datetime
    reviewed_at: Optional[datetime]
    model_config = {"from_attributes": True}

"""
app/modules/employee_portal/announcements/schemas.py

================================================================================
ANNOUNCEMENTS — Pydantic Schemas
================================================================================

WHAT THIS FILE DOES:
    Defines the request/response shapes for the announcements API. Validates what
    a manager can post and what the API returns to employees reading the feed.

WHERE IT LIVES:
    app/modules/employee_portal/announcements/schemas.py
    Sits between announcements/router.py (HTTP) and announcements/service.py
    (business logic).

SCHEMA OVERVIEW:
    AnnouncementCreateSchema   → manager posts a new announcement
    AnnouncementUpdateSchema   → manager edits / hides an existing one
    AnnouncementResponseSchema → what the API returns for any announcement

DESIGN NOTES:
    - created_by is NOT in the create schema. It is taken from the authenticated
      manager's token server-side, so the author can't be spoofed.
    - branch_id is optional on create: omit/null = company-wide announcement,
      set = branch-specific. company_id is always required.
    - is_active is only editable via update (to hide an old post), not on create
      — new announcements are active by default.
================================================================================
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# --- Create (manager posts) ---

class AnnouncementCreateSchema(BaseModel):
    """
    Payload a manager sends to publish a new announcement.
    created_by is resolved from the auth token, NOT sent by the client.
    """
    company_id: str                        # Required — which company this belongs to
    branch_id: Optional[str] = None        # Null = company-wide, set = branch-only
    title: str                             # Short headline
    content: str                           # Full body text


# --- Update (manager edits / hides) ---

class AnnouncementUpdateSchema(BaseModel):
    """
    Payload to edit an existing announcement or hide it (is_active = False).
    All fields optional — only the provided ones are changed.
    """
    title: Optional[str] = None
    content: Optional[str] = None
    branch_id: Optional[str] = None
    is_active: Optional[bool] = None       # Set False to hide without deleting


# --- Response (what the API returns) ---

class AnnouncementResponseSchema(BaseModel):
    """Full representation of an announcement returned by the API."""
    id: str
    company_id: str
    branch_id: Optional[str]
    title: str
    content: str
    created_by: str
    is_active: bool
    published_at: datetime
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}
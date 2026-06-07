"""
app/modules/employee_portal/documents/schemas.py

================================================================================
DOCUMENTS — Pydantic Schemas
================================================================================

WHAT THIS FILE DOES:
    Defines the request/response shapes for the employee document center API.
    Validates what HR can upload (metadata) and what the API returns.

WHERE IT LIVES:
    app/modules/employee_portal/documents/schemas.py
    Sits between documents/router.py (HTTP) and documents/service.py (logic).

SCHEMA OVERVIEW:
    DocumentCreateSchema   → HR registers a new document (metadata + file_url)
    DocumentUpdateSchema   → HR edits metadata / toggles visibility
    DocumentResponseSchema → what the API returns for any document

IMPORTANT — FILE UPLOAD FLOW:
    These schemas handle METADATA only. The actual file upload (multipart →
    object storage) is a separate step that produces a `file_url`. The typical
    flow is:
        1. Client uploads the raw file to a storage endpoint → gets file_url.
        2. Client calls POST /documents with that file_url + metadata (this schema).
    For now we accept file_url directly so the table structure is ready; the
    storage upload endpoint is wired in later when object storage is configured.

DESIGN NOTES:
    - uploaded_by is NOT in the create schema — taken from the auth token.
    - is_visible_to_employee defaults to True on create; can be flipped via update
      to hide a document from the employee without deleting it.
================================================================================
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.modules.employee_portal.documents.models import DocType


# --- Create (HR registers a document) ---

class DocumentCreateSchema(BaseModel):
    """
    Payload to register a new employee document (metadata).
    file_url is produced by the separate file-upload step (object storage).
    uploaded_by is resolved from the auth token, NOT sent by the client.
    """
    employee_id: str                       # Owner of the document
    company_id: str                        # Which company (denormalized)
    doc_type: DocType = DocType.OTHER
    title: str                             # Display name
    description: Optional[str] = None
    file_url: str                          # Location in object storage
    file_name: Optional[str] = None        # Original filename
    file_size: Optional[str] = None        # Human-readable size
    mime_type: Optional[str] = None
    is_visible_to_employee: bool = True     # Show to employee by default


# --- Update (HR edits metadata / visibility) ---

class DocumentUpdateSchema(BaseModel):
    """
    Payload to edit document metadata or toggle visibility.
    All fields optional — only provided ones are changed.
    """
    doc_type: Optional[DocType] = None
    title: Optional[str] = None
    description: Optional[str] = None
    is_visible_to_employee: Optional[bool] = None


# --- Response (what the API returns) ---

class DocumentResponseSchema(BaseModel):
    """Full representation of an employee document returned by the API."""
    id: str
    employee_id: str
    company_id: str
    doc_type: DocType
    title: str
    description: Optional[str]
    file_url: str
    file_name: Optional[str]
    file_size: Optional[str]
    mime_type: Optional[str]
    uploaded_by: str
    is_visible_to_employee: bool
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}
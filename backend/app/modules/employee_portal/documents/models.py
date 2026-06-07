"""
app/modules/employee_portal/documents/models.py

================================================================================
DOCUMENTS MODEL — Employee Portal
================================================================================

WHAT THIS FILE DOES:
    Defines the database model for the employee document center. This is where
    HR-related files are stored and shared: employment contracts, payslips,
    certificates, ID documents, etc. Each document belongs to one employee.

WHERE IT LIVES:
    app/modules/employee_portal/
        ├── leaves/          (leave requests — DONE)
        ├── announcements/   (news feed — DONE)
        ├── documents/       ← YOU ARE HERE (employee document center)
        └── shift_swaps/     (shift exchange requests)

WHAT GETS STORED HERE (and what doesn't):
    This table stores document METADATA, not the file bytes. The actual file
    lives in object storage (S3 / MinIO / local disk) and we keep its location
    in `file_url`. This is the standard pattern: databases hold pointers, blob
    storage holds blobs. Keeps the DB small and fast.

VISIBILITY CONTROL (is_visible_to_employee):
    Some documents are uploaded by HR but shouldn't be shown to the employee yet
    (e.g. a draft contract, an internal note). is_visible_to_employee gates this:
        - True  → employee sees it in their portal
        - False → only managers/HR see it (hidden from the employee)

KEY RELATIONSHIPS:
    employee_id → employees.id  (whose document this is)
    company_id  → companies.id  (denormalized for company-wide queries)
    uploaded_by → users.id      (which manager/HR person uploaded it)

    uploaded_by is a User because uploads are done by people with login access
    (HR, managers). employee_id is an Employee because the document belongs to a
    staff member who may or may not have system access.
================================================================================
"""

import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime, Text,
    ForeignKey, Enum as SAEnum
)
from app.core.database import Base


class DocType(str, enum.Enum):
    """
    Categories of employee document. Used for filtering and for showing the
    right icon/section in the portal UI.
    """
    CONTRACT    = "contract"     # İş sözleşmesi — employment contract
    PAYSLIP     = "payslip"      # Bordro / maaş pusulası — monthly payslip
    CERTIFICATE = "certificate"  # Sertifika / belge — certificates, diplomas
    ID_DOCUMENT = "id_document"  # Kimlik / SGK belgesi — ID, social security docs
    OTHER       = "other"        # Anything else


class EmployeeDocument(Base):
    """
    A single document belonging to an employee.

    One employee can have many documents. The file itself is in object storage;
    this row holds its metadata and location (file_url).
    """
    __tablename__ = "employee_documents"

    id            = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # --- Relationships (whose & where) ---
    employee_id   = Column(String, ForeignKey("employees.id"), nullable=False)   # Owner
    company_id    = Column(String, ForeignKey("companies.id"), nullable=False)   # Denormalized

    # --- Document info ---
    doc_type      = Column(SAEnum(DocType), default=DocType.OTHER, nullable=False)
    title         = Column(String, nullable=False)         # Display name e.g. "2026 Ocak Bordro"
    description   = Column(Text, nullable=True)            # Optional note
    file_url      = Column(String, nullable=False)         # Location in object storage
    file_name     = Column(String, nullable=True)          # Original filename
    file_size     = Column(String, nullable=True)          # Human-readable size e.g. "240 KB"
    mime_type     = Column(String, nullable=True)          # e.g. "application/pdf"

    # --- Authorship & visibility ---
    uploaded_by             = Column(String, ForeignKey("users.id"), nullable=False)  # HR/manager
    is_visible_to_employee  = Column(Boolean, default=True, nullable=False)           # Gate

    # --- Timestamps ---
    created_at    = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at    = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
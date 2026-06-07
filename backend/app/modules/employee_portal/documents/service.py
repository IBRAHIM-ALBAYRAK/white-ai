"""
app/modules/employee_portal/documents/service.py

================================================================================
DOCUMENTS — Business Logic (Service Layer)
================================================================================

WHAT THIS FILE DOES:
    Business rules for the employee document center: registering documents,
    listing them for managers vs employees (with visibility gating), and
    removing them.

WHERE IT LIVES:
    app/modules/employee_portal/documents/service.py
    Called by documents/router.py. Talks to the EmployeeDocument model.

CORE RULES ENFORCED HERE:
    1. uploaded_by is stamped from the authenticated HR/manager — not client input.
    2. Two different listing views:
         - Manager view (get_by_employee): ALL documents, including hidden ones.
         - Employee view (get_visible_for_employee): only is_visible_to_employee.
    3. Delete here is a HARD delete of the metadata row. (The blob in object
       storage should be cleaned up by the storage layer separately. For now we
       only remove the DB record so the structure is testable.)

DESIGN NOTES:
    - The visibility split is the key feature: HR can stage a document
      (is_visible_to_employee = False) and reveal it later, without the employee
      ever seeing a half-ready file.
    - Unlike leaves/announcements which are append-only history, documents can be
      genuinely deleted because a wrongly-uploaded file (e.g. another person's
      payslip) must be removable for privacy reasons.
================================================================================
"""

import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.modules.employee_portal.documents.models import EmployeeDocument
from app.modules.employee_portal.documents.schemas import (
    DocumentCreateSchema, DocumentUpdateSchema
)
from app.core.exceptions import NotFoundException


class DocumentService:

    # ── Create ───────────────────────────────────────────────────────────────

    async def create_document(
        self, db: AsyncSession, uploader_id: str, data: DocumentCreateSchema
    ) -> EmployeeDocument:
        """
        Register a new employee document.
        uploader_id comes from the authenticated HR/manager's token.
        """
        document = EmployeeDocument(
            id=str(uuid.uuid4()),
            employee_id=data.employee_id,
            company_id=data.company_id,
            doc_type=data.doc_type,
            title=data.title,
            description=data.description,
            file_url=data.file_url,
            file_name=data.file_name,
            file_size=data.file_size,
            mime_type=data.mime_type,
            uploaded_by=uploader_id,                        # stamped server-side
            is_visible_to_employee=data.is_visible_to_employee,
        )
        db.add(document)
        await db.flush()
        return document

    # ── Read ─────────────────────────────────────────────────────────────────

    async def get_document(self, db: AsyncSession, document_id: str) -> EmployeeDocument:
        """Return a single document by ID."""
        result = await db.execute(
            select(EmployeeDocument).where(EmployeeDocument.id == document_id)
        )
        document = result.scalar_one_or_none()
        if not document:
            raise NotFoundException("Document not found.")
        return document

    async def get_by_employee(self, db: AsyncSession, employee_id: str) -> list[EmployeeDocument]:
        """
        Manager / HR view: ALL documents for an employee, including hidden ones,
        newest first.
        """
        result = await db.execute(
            select(EmployeeDocument)
            .where(EmployeeDocument.employee_id == employee_id)
            .order_by(EmployeeDocument.created_at.desc())
        )
        return result.scalars().all()

    async def get_visible_for_employee(
        self, db: AsyncSession, employee_id: str
    ) -> list[EmployeeDocument]:
        """
        Employee view: only documents flagged visible to the employee,
        newest first. This is what the employee portal calls.
        """
        result = await db.execute(
            select(EmployeeDocument)
            .where(
                EmployeeDocument.employee_id == employee_id,
                EmployeeDocument.is_visible_to_employee == True,
            )
            .order_by(EmployeeDocument.created_at.desc())
        )
        return result.scalars().all()

    # ── Update ───────────────────────────────────────────────────────────────

    async def update_document(
        self, db: AsyncSession, document_id: str, data: DocumentUpdateSchema
    ) -> EmployeeDocument:
        """Edit document metadata or toggle visibility. Only provided fields change."""
        document = await self.get_document(db, document_id)
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(document, field, value)
        db.add(document)
        await db.flush()
        return document

    # ── Delete ───────────────────────────────────────────────────────────────

    async def delete_document(self, db: AsyncSession, document_id: str) -> None:
        """
        Hard-delete a document metadata row.
        (Blob cleanup in object storage is handled separately by the storage layer.)
        Documents are deletable — unlike leaves/announcements — for privacy reasons
        (e.g. a payslip uploaded to the wrong employee must be removable).
        """
        document = await self.get_document(db, document_id)  # raises if not found
        await db.execute(
            delete(EmployeeDocument).where(EmployeeDocument.id == document_id)
        )
        await db.flush()


document_service = DocumentService()
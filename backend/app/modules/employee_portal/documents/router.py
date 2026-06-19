"""
app/modules/employee_portal/documents/router.py

================================================================================
DOCUMENTS — API Router (HTTP Layer)
================================================================================

Thin HTTP layer over document_service. Handles document METADATA. The uploader
(uploaded_by) comes from the auth token, never the request body.

ENDPOINTS:
    POST   /api/v1/documents                       → HR registers a document
    GET    /api/v1/documents/employee/{id}          → manager view (all, incl. hidden)
    GET    /api/v1/documents/employee/{id}/visible  → employee view (visible only)
    GET    /api/v1/documents/{id}                   → single document
    PUT    /api/v1/documents/{id}                   → edit metadata / toggle visibility
    DELETE /api/v1/documents/{id}                   → remove document

TENANT ISOLATION (documents hold employee PII — contracts, IDs):
    - employee-scoped endpoints (create / list-by-employee): assert_employee_company_access
    - single-document endpoints (get / update / delete): _assert_document resolves
      the document's employee → company and checks access
    - visible feed: assert_employee_access (own-profile for plain employees) PLUS
      assert_employee_company_access for admins (tenant scope)
================================================================================
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import (
    get_current_user, require_role,
    assert_employee_access, assert_employee_company_access,
)
from app.modules.auth.models import User, UserRole
from app.modules.employee_portal.documents.schemas import (
    DocumentCreateSchema,
    DocumentUpdateSchema,
    DocumentResponseSchema,
)
from app.modules.employee_portal.documents.service import document_service

router = APIRouter(prefix="/documents", tags=["Documents"])

staff = require_role(UserRole.SUPERADMIN, UserRole.OWNER, UserRole.MANAGER)
ADMIN_ROLES = (UserRole.SUPERADMIN, UserRole.OWNER, UserRole.MANAGER)


async def _assert_document(db: AsyncSession, current_user: User, document_id: str) -> None:
    """Resolve a document's employee → company and assert the caller can access it."""
    doc = await document_service.get_document(db, document_id)
    await assert_employee_company_access(db, current_user, doc.employee_id)


@router.post("", response_model=DocumentResponseSchema)
async def create_document(
    data: DocumentCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await assert_employee_company_access(db, current_user, data.employee_id)
    return await document_service.create_document(
        db, uploader_id=current_user.id, data=data
    )


@router.get("/employee/{employee_id}", response_model=list[DocumentResponseSchema])
async def list_by_employee(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await assert_employee_company_access(db, current_user, employee_id)
    return await document_service.get_by_employee(db, employee_id)


@router.get("/employee/{employee_id}/visible", response_model=list[DocumentResponseSchema])
async def list_visible_for_employee(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await assert_employee_access(db, current_user, employee_id)
    if current_user.role in ADMIN_ROLES:
        await assert_employee_company_access(db, current_user, employee_id)
    return await document_service.get_visible_for_employee(db, employee_id)


@router.get("/{document_id}", response_model=DocumentResponseSchema)
async def get_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await _assert_document(db, current_user, document_id)
    return await document_service.get_document(db, document_id)


@router.put("/{document_id}", response_model=DocumentResponseSchema)
async def update_document(
    document_id: str,
    data: DocumentUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await _assert_document(db, current_user, document_id)
    return await document_service.update_document(db, document_id, data)


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await _assert_document(db, current_user, document_id)
    await document_service.delete_document(db, document_id)
    return {"message": "Document deleted."}
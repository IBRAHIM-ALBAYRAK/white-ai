"""
app/modules/employee_portal/documents/router.py

================================================================================
DOCUMENTS — API Router (HTTP Layer)
================================================================================

WHAT THIS FILE DOES:
    Exposes the employee document center endpoints over HTTP. Thin layer:
    authenticates, parses input, delegates to document_service. The uploader
    (uploaded_by) is taken from the auth token, never from the request body.

WHERE IT LIVES:
    app/modules/employee_portal/documents/router.py
    Registered in app/main.py under the /api/v1 prefix.

ENDPOINTS:
    POST   /api/v1/documents                       → HR registers a document
    GET    /api/v1/documents/employee/{id}          → manager view (all, incl. hidden)
    GET    /api/v1/documents/employee/{id}/visible  → employee view (visible only)
    GET    /api/v1/documents/{id}                   → single document
    PUT    /api/v1/documents/{id}                   → edit metadata / toggle visibility
    DELETE /api/v1/documents/{id}                   → remove document

AUTH:
    All endpoints require a valid Bearer token. On create, the uploader's user id
    (token "sub") is stamped as uploaded_by.

NOTE ON FILE UPLOAD:
    These endpoints handle document METADATA. The raw file upload to object
    storage is a separate endpoint added later; for now the client supplies a
    file_url so the structure is complete and testable.
================================================================================
"""



from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user, require_role, assert_employee_access
from app.modules.auth.models import User, UserRole
from app.modules.employee_portal.documents.schemas import (
    DocumentCreateSchema,
    DocumentUpdateSchema,
    DocumentResponseSchema,
)
from app.modules.employee_portal.documents.service import document_service

router = APIRouter(prefix="/documents", tags=["Documents"])

staff = require_role(UserRole.SUPERADMIN, UserRole.OWNER, UserRole.MANAGER)


@router.post("", response_model=DocumentResponseSchema)
async def create_document(
    data: DocumentCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    return await document_service.create_document(
        db, uploader_id=current_user.id, data=data
    )


@router.get("/employee/{employee_id}", response_model=list[DocumentResponseSchema])
async def list_by_employee(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    return await document_service.get_by_employee(db, employee_id)


@router.get("/employee/{employee_id}/visible", response_model=list[DocumentResponseSchema])
async def list_visible_for_employee(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await assert_employee_access(db, current_user, employee_id)
    return await document_service.get_visible_for_employee(db, employee_id)


@router.get("/{document_id}", response_model=DocumentResponseSchema)
async def get_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    return await document_service.get_document(db, document_id)


@router.put("/{document_id}", response_model=DocumentResponseSchema)
async def update_document(
    document_id: str,
    data: DocumentUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    return await document_service.update_document(db, document_id, data)


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    await document_service.delete_document(db, document_id)
    return {"message": "Document deleted."}
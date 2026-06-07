"""
app/modules/users/router.py

API endpoints for User management.
All routes are protected — only authenticated users can access them.

Endpoints:
  POST   /users                          — Create a new employee
  GET    /users/branch/{branch_id}       — List all users in a branch
  GET    /users/company/{company_id}     — List all users in a company
  GET    /users/{user_id}                — Get a single user
  PUT    /users/{user_id}                — Update a user
  DELETE /users/{user_id}               — Deactivate a user (no password)
  DELETE /users/{user_id}/verified      — Deactivate a user (admin password required)
"""

from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedException
from app.modules.users.schemas import (
    EmployeeCreateSchema,
    UserUpdateSchema,
    UserResponseSchema,
)
from app.modules.users.service import user_service

router = APIRouter(prefix="/users", tags=["Users"])
security = HTTPBearer()


class DeactivateWithPasswordSchema(BaseModel):
    admin_password: str


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = decode_token(credentials.credentials)
    if not payload:
        raise UnauthorizedException("Invalid or expired token.")
    return payload


@router.post("", response_model=UserResponseSchema)
async def create_employee(
    data: EmployeeCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await user_service.create_employee(db, data)


@router.get("/branch/{branch_id}", response_model=list[UserResponseSchema])
async def list_by_branch(
    branch_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await user_service.get_users_by_branch(db, branch_id)


@router.get("/company/{company_id}", response_model=list[UserResponseSchema])
async def list_by_company(
    company_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await user_service.get_users_by_company(db, company_id)


@router.get("/{user_id}", response_model=UserResponseSchema)
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await user_service.get_user(db, user_id)


@router.put("/{user_id}", response_model=UserResponseSchema)
async def update_user(
    user_id: str,
    data: UserUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await user_service.update_user(db, user_id, data)


@router.delete("/{user_id}")
async def deactivate_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    await user_service.deactivate_user(db, user_id)
    return {"message": "User deactivated."}


@router.delete("/{user_id}/verified")
async def deactivate_user_verified(
    user_id: str,
    data: DeactivateWithPasswordSchema,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    await user_service.deactivate_user_verified(
        db,
        user_id=user_id,
        admin_id=current_user["sub"],
        admin_password=data.admin_password,
    )
    return {"message": "User deactivated."}
"""
app/modules/users/router.py

User (auth identity) management — the most privilege-sensitive module:
creating a user and setting/updating their ROLE happens here. Locked to admins.
  - Writes (create/update/deactivate): superadmin, owner
  - Reads  (list/get): superadmin, owner, manager
NOTE: tenant scoping (#5b) still pending.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import require_role
from app.modules.auth.models import User, UserRole
from app.modules.users.schemas import (
    EmployeeCreateSchema,
    UserUpdateSchema,
    UserResponseSchema,
)
from app.modules.users.service import user_service

router = APIRouter(prefix="/users", tags=["Users"])

admin_write = require_role(UserRole.SUPERADMIN, UserRole.OWNER)
staff = require_role(UserRole.SUPERADMIN, UserRole.OWNER, UserRole.MANAGER)


class DeactivateWithPasswordSchema(BaseModel):
    admin_password: str


@router.post("", response_model=UserResponseSchema)
async def create_employee(
    data: EmployeeCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_write),
):
    return await user_service.create_employee(db, data)


@router.get("/branch/{branch_id}", response_model=list[UserResponseSchema])
async def list_by_branch(
    branch_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    return await user_service.get_users_by_branch(db, branch_id)


@router.get("/company/{company_id}", response_model=list[UserResponseSchema])
async def list_by_company(
    company_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    return await user_service.get_users_by_company(db, company_id)


@router.get("/{user_id}", response_model=UserResponseSchema)
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(staff),
):
    return await user_service.get_user(db, user_id)


@router.put("/{user_id}", response_model=UserResponseSchema)
async def update_user(
    user_id: str,
    data: UserUpdateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_write),
):
    return await user_service.update_user(db, user_id, data)


@router.delete("/{user_id}")
async def deactivate_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_write),
):
    await user_service.deactivate_user(db, user_id)
    return {"message": "User deactivated."}


@router.delete("/{user_id}/verified")
async def deactivate_user_verified(
    user_id: str,
    data: DeactivateWithPasswordSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(admin_write),
):
    await user_service.deactivate_user_verified(
        db,
        user_id=user_id,
        admin_id=current_user.id,
        admin_password=data.admin_password,
    )
    return {"message": "User deactivated."}
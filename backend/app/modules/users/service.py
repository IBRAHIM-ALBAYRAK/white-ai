"""
app/modules/users/service.py

Business logic for User management.

Key rules:
  - Only OWNER or SUPERADMIN can create new employees.
  - Email must be unique across all users.
  - Password is hashed before storing.
  - Deactivating a user does not delete them — soft delete via is_active flag.
"""

import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.modules.auth.models import User, UserRole
from app.modules.users.schemas import EmployeeCreateSchema, UserUpdateSchema
from app.core.security import hash_password, verify_password
from app.core.exceptions import BadRequestException, NotFoundException


class UserService:

    async def create_employee(self, db: AsyncSession, data: EmployeeCreateSchema) -> User:
        """Create a new employee account."""
        existing = await db.execute(select(User).where(User.email == data.email))
        if existing.scalar_one_or_none():
            raise BadRequestException("A user with this email already exists.")

        try:
            role = UserRole(data.role)
        except ValueError:
            raise BadRequestException(f"Invalid role: {data.role}. Valid roles: employee, manager, owner, superadmin.")

        user = User(
            id=str(uuid.uuid4()),
            first_name=data.first_name,
            last_name=data.last_name,
            email=data.email,
            hashed_password=hash_password(data.password),
            phone=data.phone,
            role=role,
            company_id=data.company_id,
            branch_id=data.branch_id,
            is_active=True,
        )
        db.add(user)
        await db.flush()
        return user

    async def get_users_by_branch(self, db: AsyncSession, branch_id: str) -> list[User]:
        """Return all active users for a branch."""
        result = await db.execute(
            select(User).where(User.branch_id == branch_id, User.is_active == True)
            .order_by(User.first_name)
        )
        return result.scalars().all()

    async def get_users_by_company(self, db: AsyncSession, company_id: str) -> list[User]:
        """Return all active users for a company."""
        result = await db.execute(
            select(User).where(User.company_id == company_id, User.is_active == True)
            .order_by(User.first_name)
        )
        return result.scalars().all()

    async def get_user(self, db: AsyncSession, user_id: str) -> User:
        """Return a single user by ID."""
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise NotFoundException("User not found.")
        return user

    async def update_user(self, db: AsyncSession, user_id: str, data: UserUpdateSchema) -> User:
        """Update user profile fields."""
        user = await self.get_user(db, user_id)
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(user, field, value)
        db.add(user)
        await db.flush()
        return user

        

    async def deactivate_user(self, db: AsyncSession, user_id: str) -> None:
        """Soft delete — set is_active to False."""
        user = await self.get_user(db, user_id)
        user.is_active = False
        db.add(user)
        await db.flush()

    async def deactivate_user_verified(
        self, db: AsyncSession, user_id: str, admin_id: str, admin_password: str
    ) -> None:
        """Soft delete with admin password verification."""
        # Verify admin password
        admin = await self.get_user(db, admin_id)
        if not verify_password(admin_password, admin.hashed_password):
            raise BadRequestException("Incorrect admin password.")

        # Prevent self-deletion
        if user_id == admin_id:
            raise BadRequestException("You cannot deactivate your own account.")

        user = await self.get_user(db, user_id)
        user.is_active = False
        db.add(user)
        await db.flush()


user_service = UserService()
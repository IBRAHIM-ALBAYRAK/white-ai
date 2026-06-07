"""
app/modules/auth/service.py

Contains all business logic for authentication.
Router receives the request and delegates to service.
Service handles: user registration, login, token refresh, logout, and password change.
Direct database and Redis interactions happen here, not in the router.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.modules.auth.models import User
from app.modules.auth.schemas import UserRegisterSchema, UserLoginSchema, ChangePasswordSchema
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.exceptions import AlreadyExistsException, UnauthorizedException, NotFoundException
from app.core.redis import get_redis
import uuid

class AuthService:

    async def register(self, db: AsyncSession, data: UserRegisterSchema) -> User:
        """Register a new user. Raises exception if email already exists."""
        result = await db.execute(select(User).where(User.email == data.email))
        existing = result.scalar_one_or_none()
        if existing:
            raise AlreadyExistsException("A user with this email already exists.")

        user = User(
            id=str(uuid.uuid4()),
            first_name=data.first_name,
            last_name=data.last_name,
            email=data.email,
            phone=data.phone,
            hashed_password=hash_password(data.password),
            role=data.role,
            company_id=data.company_id,
            branch_id=data.branch_id,
        )
        db.add(user)
        await db.flush()
        return user

    async def login(self, db: AsyncSession, data: UserLoginSchema) -> dict:
        """Authenticate user and return access + refresh tokens."""
        result = await db.execute(select(User).where(User.email == data.email))
        user = result.scalar_one_or_none()

        if not user or not verify_password(data.password, user.hashed_password):
            raise UnauthorizedException("Invalid email or password.")

        if not user.is_active:
            raise UnauthorizedException("This account has been deactivated.")

        token_data = {"sub": user.id, "role": user.role.value}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": user,
        }

    async def refresh(self, refresh_token: str) -> dict:
        """Issue a new access token using a valid refresh token."""
        payload = decode_token(refresh_token)
        if not payload:
            raise UnauthorizedException("Invalid or expired refresh token.")

        token_data = {"sub": payload["sub"], "role": payload["role"]}
        new_access_token = create_access_token(token_data)

        return {
            "access_token": new_access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }

    async def logout(self, token: str) -> None:
        """Blacklist the access token in Redis to invalidate it immediately."""
        payload = decode_token(token)
        if not payload:
            raise UnauthorizedException("Invalid token.")

        redis = await get_redis()
        exp = payload.get("exp", 0)
        import time
        ttl = int(exp - time.time())
        if ttl > 0:
            await redis.setex(f"blacklist:{token}", ttl, "blacklisted")

    async def change_password(self, db: AsyncSession, user_id: str, data: ChangePasswordSchema) -> None:
        """Change user password after verifying current password."""
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise NotFoundException("User not found.")
        if not verify_password(data.current_password, user.hashed_password):
            raise UnauthorizedException("Current password is incorrect.")
        user.hashed_password = hash_password(data.new_password)
        db.add(user)

auth_service = AuthService()
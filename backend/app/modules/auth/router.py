"""
app/modules/auth/router.py

Defines the API endpoints for authentication.
Router catches incoming requests and delegates to AuthService.
No business logic here — only request/response handling.

Endpoints:
  POST /auth/register         — Register a new user
  POST /auth/login            — Login and receive tokens
  POST /auth/refresh          — Get a new access token using refresh token
  POST /auth/logout           — Invalidate the current access token
  POST /auth/change-password  — Change authenticated user's password
"""

from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedException
from app.modules.auth.schemas import (
    UserRegisterSchema,
    UserLoginSchema,
    TokenRefreshSchema,
    TokenResponseSchema,
    UserResponseSchema,
    ChangePasswordSchema,
)
from app.modules.auth.service import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

@router.post("/register", response_model=UserResponseSchema)
async def register(data: UserRegisterSchema, db: AsyncSession = Depends(get_db)):
    user = await auth_service.register(db, data)
    return user

@router.post("/login", response_model=TokenResponseSchema)
async def login(data: UserLoginSchema, db: AsyncSession = Depends(get_db)):
    return await auth_service.login(db, data)

@router.post("/refresh")
async def refresh(data: TokenRefreshSchema):
    return await auth_service.refresh(data.refresh_token)

@router.post("/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    await auth_service.logout(credentials.credentials)
    return {"message": "Successfully logged out."}

@router.post("/change-password")
async def change_password(
    data: ChangePasswordSchema,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    payload = decode_token(credentials.credentials)
    if not payload:
        raise UnauthorizedException("Invalid or expired token.")
    await auth_service.change_password(db, payload["sub"], data)
    return {"message": "Password changed successfully."}
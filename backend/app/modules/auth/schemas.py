"""
app/modules/auth/schemas.py

Defines the shape of data coming into and going out of the Auth API.
Schemas validate incoming requests automatically — if a required field is missing,
FastAPI returns an error before the request even reaches the business logic.
Models define database structure; schemas define API structure.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from app.modules.auth.models import UserRole

# --- Request Schemas (incoming data) ---

class UserRegisterSchema(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    role: UserRole = UserRole.EMPLOYEE
    company_id: Optional[str] = None
    branch_id: Optional[str] = None

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str

class TokenRefreshSchema(BaseModel):
    refresh_token: str

# --- Response Schemas (outgoing data) ---

class UserResponseSchema(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    phone: Optional[str]
    role: UserRole
    company_id: Optional[str]
    branch_id: Optional[str]
    is_active: bool

    model_config = {"from_attributes": True}

class TokenResponseSchema(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponseSchema


class ChangePasswordSchema(BaseModel):
    current_password: str
    new_password: str
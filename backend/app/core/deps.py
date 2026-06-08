"""
app/core/deps.py

Centralized auth dependencies:
  - get_current_user: decodes the token, loads the user from DB, ensures active.
  - require_role(...): factory enforcing role-based access.
  - assert_employee_access(...): ownership guard for employee-facing endpoints —
    admins pass; a plain employee may only touch their OWN employee_id.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import decode_token
from app.modules.auth.models import User, UserRole
from app.modules.employees.models import Employee
from app.modules.company.models import Company, OversightLink

security = HTTPBearer()

ADMIN_ROLES = (UserRole.SUPERADMIN, UserRole.OWNER, UserRole.MANAGER)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token.")
    result = await db.execute(select(User).where(User.id == payload.get("sub")))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive.")
    return user


def require_role(*allowed_roles: UserRole):
    async def checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action.",
            )
        return current_user
    return checker


async def assert_employee_access(
    db: AsyncSession, current_user: User, target_employee_id: str
) -> None:
    """
    Ownership guard for employee-facing endpoints.
    Admins (superadmin/owner/manager) are allowed through. A plain employee may
    only act on their OWN employee profile: we resolve their employee.id from the
    token's user and require it to match target_employee_id.
    """
    if current_user.role in ADMIN_ROLES:
        return
    result = await db.execute(
        select(Employee.id).where(
            Employee.user_id == current_user.id,
            Employee.is_active == True,
        )
    )
    own_id = result.scalar_one_or_none()
    if own_id is None or own_id != target_employee_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own data.",
        )

async def get_accessible_company_ids(db: AsyncSession, current_user: User) -> list[str] | None:
    """
    Bu kullanıcının VERİSİNİ GÖREBİLECEĞİ company id'lerini döndürür.

    Dönüş:
      - None  -> kısıtlama yok (superadmin her şeyi görür). Çağıran taraf filtre uygulamaz.
      - list  -> sadece bu id'lere ait veriye erişilebilir.

    Kurallar:
      - SUPERADMIN: None (tüm sistem).
      - OWNER/MANAGER/EMPLOYEE: kendi company_id'si. Ek olarak, kendi company'si
        "brand" ise, oversight_links üzerinden bağlı tüm alt company'ler de eklenir
        (marka sahibi franchise/şubelerini görür).
    """
    if current_user.role == UserRole.SUPERADMIN:
        return None

    own = current_user.company_id
    if own is None:
        return []  # company'ye bağlı değilse hiçbir şey göremez

    ids = {own}

    # Kendi company'si "brand" mı? Öyleyse denetlediği alt company'leri ekle.
    company = (await db.execute(
        select(Company).where(Company.id == own)
    )).scalar_one_or_none()

    if company is not None and company.company_type == "brand":
        sub_rows = (await db.execute(
            select(OversightLink.sub_company_id).where(
                OversightLink.brand_company_id == own
            )
        )).scalars().all()
        ids.update(sub_rows)

    return list(ids)


async def get_oversight_link_type(db: AsyncSession, brand_company_id: str, sub_company_id: str) -> str | None:
    """
    Marka ile alt company arasındaki bağın tipini döndürür: "full", "franchise" veya None.
    Yetki ince ayarı için kullanılır (örn. brand, franchise'ın bordrosunu göremez ama
    "full" bağlı kendi şubesinin bordrosunu görür).
    """
    return (await db.execute(
        select(OversightLink.link_type).where(
            OversightLink.brand_company_id == brand_company_id,
            OversightLink.sub_company_id == sub_company_id,
        )
    )).scalar_one_or_none()
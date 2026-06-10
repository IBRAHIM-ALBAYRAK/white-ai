"""
app/modules/oversight/router.py

Brand → sub-company (franchise) management.

  POST /api/v1/oversight/subs        → brand creates a sub-company + oversight link
  GET  /api/v1/oversight/subs        → brand lists its sub-companies (with link_type)

Rules:
  - Only an OWNER (or SUPERADMIN) may manage subs. A manager cannot.
  - The caller's company becomes the brand. On the first sub it creates, the
    caller's company is auto-promoted to company_type="brand".
  - The new sub-company gets company_type="sub" and an oversight_links row
    (brand_company_id = caller's company, sub_company_id = new, link_type chosen).
  - Owner assignment is a SEPARATE step (POST /users with company_id + role=owner).
"""

import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import require_role, is_franchise_company, get_current_user
from app.modules.auth.models import User, UserRole
from app.modules.company.models import Company, OversightLink, Branch
from app.modules.employees.models import Employee
from app.modules.inventory.models import Product
from app.modules.company.models import Branch as BranchModel
from sqlalchemy import func
from app.modules.employees.models import Employee
from app.core.deps import get_current_user
from app.modules.company.schemas import CompanyCreateSchema
from app.modules.company.service import company_service
from app.modules.oversight.schemas import SubCreateSchema, SubResponseSchema, BrandCreateSchema, BrandCreateResponseSchema
from app.modules.users.schemas import EmployeeCreateSchema
from app.modules.users.service import user_service


router = APIRouter(prefix="/oversight", tags=["Oversight (Brand)"])

owner_only = require_role(UserRole.SUPERADMIN, UserRole.OWNER)


def _validate_link_type(link_type: str) -> str:
    lt = (link_type or "").lower()
    if lt not in ("full", "franchise"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="link_type 'full' veya 'franchise' olmali.")
    return lt


superadmin_only = require_role(UserRole.SUPERADMIN)


@router.post("/brands", response_model=BrandCreateResponseSchema)
async def create_brand(
    data: BrandCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(superadmin_only),
):
    """WHITE.AI (superadmin) onboards a brand customer: creates the brand company
    AND its owner account in one shot. Atomic: both or neither."""
    # 1) Marka sirketini olustur, company_type='brand'
    company = await company_service.create_company(
        db, CompanyCreateSchema(name=data.name, email=data.email, phone=data.phone, address=data.address)
    )
    company.company_type = "brand"
    company.legal_name = data.legal_name
    await db.flush()

    # 2) Marka sahibi (owner) hesabini olustur
    owner = await user_service.create_employee(
        db,
        EmployeeCreateSchema(
            first_name=data.owner_first_name,
            last_name=data.owner_last_name,
            email=data.owner_email,
            password=data.owner_password,
            company_id=company.id,
            role="owner",
        ),
    )

    return BrandCreateResponseSchema(
        company_id=company.id,
        company_name=company.name,
        owner_email=owner.email,
        owner_user_id=owner.id,
    )


@router.post("/subs", response_model=SubResponseSchema)
async def create_sub(
    data: SubCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(owner_only),
):
    link_type = _validate_link_type(data.link_type)

    if current_user.company_id is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bir markaya bagli degilsiniz.")

    # Bir franchise (baska bir markanin alt sirketi) kendi altina sub/franchise acamaz.
    # Sadece superadmin ya da kendisi franchise OLMAYAN bir company sub ekleyebilir.
    if current_user.role != UserRole.SUPERADMIN and await is_franchise_company(db, current_user.company_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bir markanin franchise'i oldugunuz icin alt sirket ekleyemezsiniz.",
        )

    brand_id = current_user.company_id

    # 1) Create the sub-company (reuse company service for email-uniqueness etc.)
    sub = await company_service.create_company(
        db, CompanyCreateSchema(name=data.name, email=data.email, phone=data.phone, address=data.address)
    )
    sub.company_type = "sub"

    # 2) Promote the caller's company to "brand" if not already.
    brand = (await db.execute(select(Company).where(Company.id == brand_id))).scalar_one_or_none()
    if brand is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Marka sirketi bulunamadi.")
    if brand.company_type != "brand":
        brand.company_type = "brand"

    # 3) Create the oversight link brand → sub.
    link = OversightLink(
        id=str(uuid.uuid4()),
        brand_company_id=brand_id,
        sub_company_id=sub.id,
        link_type=link_type,
        created_at=datetime.now(timezone.utc),
    )
    db.add(link)
    await db.flush()
    await db.refresh(sub)

    return SubResponseSchema(
        id=sub.id, name=sub.name, email=sub.email, phone=sub.phone, address=sub.address,
        company_type=sub.company_type, is_active=sub.is_active, link_type=link_type,
        created_at=sub.created_at,
    )


@router.get("/subs", response_model=list[SubResponseSchema])
async def list_subs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(owner_only),
):
    if current_user.company_id is None:
        return []
    brand_id = current_user.company_id

    rows = (await db.execute(
        select(Company, OversightLink.link_type)
        .join(OversightLink, OversightLink.sub_company_id == Company.id)
        .where(OversightLink.brand_company_id == brand_id)
        .order_by(Company.created_at.desc())
    )).all()

    return [
        SubResponseSchema(
            id=c.id, name=c.name, email=c.email, phone=c.phone, address=c.address,
            company_type=c.company_type, is_active=c.is_active, link_type=lt,
            created_at=c.created_at,
        )
        for (c, lt) in rows
    ]


@router.get("/overview")
async def brand_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(owner_only),
):
    """Marka geneli ozet: sube, franchise, personel sayilari. Genel Bakis sayfasi icin."""
    brand_id = current_user.company_id

    branches_count = (await db.execute(
        select(func.count()).select_from(Branch).where(Branch.company_id == brand_id)
    )).scalar() or 0

    franchises_count = (await db.execute(
        select(func.count()).select_from(OversightLink)
        .where(OversightLink.brand_company_id == brand_id, OversightLink.link_type == "franchise")
    )).scalar() or 0

    staff_count = (await db.execute(
        select(func.count()).select_from(Employee)
        .where(Employee.company_id == brand_id, Employee.is_active == True)
    )).scalar() or 0

    return {
        "branches": branches_count,
        "franchises": franchises_count,
        "staff": staff_count,
        "on_duty": 0,        # TODO: timeclock'tan beslenecek
        "alerts": [],        # TODO: stok/izin/atama uyarilari
        "busy_branches": [], # TODO: sube bazli personel dagilimi
    }


@router.get("/franchises/{franchise_id}/summary")
async def franchise_summary(
    franchise_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(owner_only),
):
    """Tek franchise icin gozetim ozeti: personel, mesaide, kritik stok.
    Bordro/finans KAPSAM DISI (payroll oversight kurali).
    Sadece bu markaya link_type='franchise' ile bagli franchise'lar gorulebilir."""
    brand_id = current_user.company_id
    link = (await db.execute(
        select(OversightLink).where(
            OversightLink.brand_company_id == brand_id,
            OversightLink.sub_company_id == franchise_id,
            OversightLink.link_type == "franchise",
        )
    )).scalar_one_or_none()
    if link is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu franchise gozetiminizde degil.")

    staff_count = (await db.execute(
        select(func.count()).select_from(Employee)
        .where(Employee.company_id == franchise_id, Employee.is_active == True)
    )).scalar() or 0

    branch_ids = (await db.execute(
        select(BranchModel.id).where(BranchModel.company_id == franchise_id)
    )).scalars().all()

    critical_stock = 0
    if branch_ids:
        critical_stock = (await db.execute(
            select(func.count()).select_from(Product)
            .where(
                Product.branch_id.in_(branch_ids),
                Product.is_active == True,
                Product.current_stock < Product.min_stock_level,
            )
        )).scalar() or 0

    return {
        "staff": staff_count,
        "on_duty": 0,            # TODO: timeclock
        "critical_stock": critical_stock,
    }

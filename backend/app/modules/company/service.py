"""
app/modules/company/service.py

Contains all business logic for Company and Branch management.
Handles creation, listing, updating, suspension, reactivation, and deletion of
companies and branches. Every other module (workforce, inventory, timeclock)
depends on data created here.

LIFECYCLE OF A COMPANY (Fourth/Deputy-style tenant model):
  - A company is the root of all data (branches → employees → timeclock/payroll).
  - It is therefore NEVER hard-deleted while it still holds data; doing so would
    destroy historical records that are legally required to be kept.
  - Instead, a company is SUSPENDED (is_active=False). Suspension also disables
    login for every user account tied to that company's ACTIVE employees, so a
    suspended tenant cannot access the system at all.
  - Reactivation re-enables the company and re-enables login ONLY for users tied
    to employees who are still active AND whose BRANCH is also active. Employees
    that were manually terminated, or whose branch is still suspended, stay
    locked out — their login is not silently restored.
  - Hard DELETE is permitted only for an empty company (no branches, no
    employees), e.g. one created by mistake. This guarantees no data loss.
"""

import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.modules.company.models import Company, Branch
from app.modules.company.schemas import (
    CompanyCreateSchema, CompanyUpdateSchema,
    BranchCreateSchema, BranchUpdateSchema
)
from app.modules.employees.models import Employee
from app.modules.auth.models import User
from app.core.security import verify_password
from app.core.exceptions import (
    AlreadyExistsException, NotFoundException, BadRequestException
)

class CompanyService:

    async def create_company(self, db: AsyncSession, data: CompanyCreateSchema) -> Company:
        """Create a new company. Email must be unique."""
        result = await db.execute(select(Company).where(Company.email == data.email))
        if result.scalar_one_or_none():
            raise AlreadyExistsException("A company with this email already exists.")
        company = Company(
            id=str(uuid.uuid4()),
            name=data.name,
            email=data.email,
            phone=data.phone,
            address=data.address,
        )
        db.add(company)
        await db.flush()
        return company

    async def get_companies(self, db: AsyncSession, allowed_ids: list[str] | None = None) -> list[Company]:
        """
        Return active companies. If allowed_ids is None, return all (superadmin).
        Otherwise restrict to the given company ids (tenant isolation).
        """
        query = select(Company).where(Company.is_active == True)
        if allowed_ids is not None:
            query = query.where(Company.id.in_(allowed_ids))
        result = await db.execute(query)
        return result.scalars().all()

    async def get_suspended_companies(self, db: AsyncSession) -> list[Company]:
        """Return all suspended (inactive) companies — used by the admin UI to
        list and reactivate them."""
        result = await db.execute(select(Company).where(Company.is_active == False))
        return result.scalars().all()

    async def get_company(self, db: AsyncSession, company_id: str) -> Company:
        """Return a single company by ID."""
        result = await db.execute(select(Company).where(Company.id == company_id))
        company = result.scalar_one_or_none()
        if not company:
            raise NotFoundException("Company not found.")
        return company

    async def update_company(self, db: AsyncSession, company_id: str, data: CompanyUpdateSchema) -> Company:
        """Update company fields."""
        company = await self.get_company(db, company_id)
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(company, field, value)
        db.add(company)
        await db.flush()
        return company

    # ── Suspend / Reactivate / Delete ────────────────────────────────────────

    async def _verify_admin(self, db: AsyncSession, admin_id: str, admin_password: str) -> None:
        """Validate the acting admin's password before a destructive action."""
        result = await db.execute(select(User).where(User.id == admin_id))
        admin = result.scalar_one_or_none()
        if not admin:
            raise NotFoundException("Admin user not found.")
        if not verify_password(admin_password, admin.hashed_password):
            raise BadRequestException("Incorrect admin password.")

    async def suspend_company(
        self, db: AsyncSession, company_id: str, admin_id: str, admin_password: str
    ) -> Company:
        """
        Suspend a company (admin-password protected).
        Sets the company inactive AND disables login for every user account tied
        to one of the company's ACTIVE employees. Data is preserved.
        """
        await self._verify_admin(db, admin_id, admin_password)
        company = await self.get_company(db, company_id)
        if not company.is_active:
            raise BadRequestException("Company is already suspended.")

        # Disable login for users linked to this company's active employees
        emp_result = await db.execute(
            select(Employee).where(
                Employee.company_id == company_id,
                Employee.is_active == True,
                Employee.user_id.isnot(None),
            )
        )
        for emp in emp_result.scalars().all():
            user_res = await db.execute(select(User).where(User.id == emp.user_id))
            user = user_res.scalar_one_or_none()
            if user and user.is_active:
                user.is_active = False
                db.add(user)

        company.is_active = False
        db.add(company)
        await db.flush()
        return company

    async def reactivate_company(
        self, db: AsyncSession, company_id: str, admin_id: str, admin_password: str
    ) -> Company:
        """
        Reactivate a suspended company (admin-password protected).
        Re-enables login ONLY for users tied to employees who are still active
        AND whose BRANCH is also active. Employees in branches that remain
        suspended stay locked out, and employees terminated before/independently
        of the suspension stay disabled.
        """
        await self._verify_admin(db, admin_id, admin_password)
        company = await self.get_company(db, company_id)
        if company.is_active:
            raise BadRequestException("Company is already active.")

        # Re-enable login ONLY for employees whose BRANCH is also active.
        # Employees in branches that are still suspended must stay locked out.
        emp_result = await db.execute(
            select(Employee)
            .join(Branch, Branch.id == Employee.branch_id)
            .where(
                Employee.company_id == company_id,
                Employee.is_active == True,
                Employee.user_id.isnot(None),
                Branch.is_active == True,
            )
        )
        for emp in emp_result.scalars().all():
            user_res = await db.execute(select(User).where(User.id == emp.user_id))
            user = user_res.scalar_one_or_none()
            if user and not user.is_active:
                user.is_active = True
                db.add(user)

        company.is_active = True
        db.add(company)
        await db.flush()
        return company

    async def delete_company(
        self, db: AsyncSession, company_id: str, admin_id: str, admin_password: str
    ) -> None:
        """
        Hard-delete a company (admin-password protected).
        Permitted ONLY when the company has NO branches and NO employees
        (active or inactive) — protects against any data loss. Otherwise the
        caller must suspend instead.
        """
        await self._verify_admin(db, admin_id, admin_password)
        company = await self.get_company(db, company_id)

        # Block deletion if any branch exists (active or not)
        branch_res = await db.execute(
            select(Branch).where(Branch.company_id == company_id)
        )
        if branch_res.scalars().first():
            raise BadRequestException(
                "Cannot delete a company that still has branches. Suspend it instead."
            )

        # Block deletion if any employee exists (active or not)
        emp_res = await db.execute(
            select(Employee).where(Employee.company_id == company_id)
        )
        if emp_res.scalars().first():
            raise BadRequestException(
                "Cannot delete a company that still has employees. Suspend it instead."
            )

        await db.delete(company)
        await db.flush()

    # ── Branches ──────────────────────────────────────────────────────────────

    async def create_branch(self, db: AsyncSession, data: BranchCreateSchema) -> Branch:
        """Create a new branch under an existing company."""
        await self.get_company(db, data.company_id)
        branch = Branch(
            id=str(uuid.uuid4()),
            company_id=data.company_id,
            name=data.name,
            address=data.address,
            phone=data.phone,
            latitude=data.latitude,
            longitude=data.longitude,
        )
        db.add(branch)
        await db.flush()
        return branch

    async def get_branches(self, db: AsyncSession, company_id: str) -> list[Branch]:
        """Return all active branches for a company."""
        result = await db.execute(
            select(Branch).where(Branch.company_id == company_id, Branch.is_active == True)
        )
        return result.scalars().all()

    async def get_branch(self, db: AsyncSession, branch_id: str) -> Branch:
        """Return a single branch by ID."""
        result = await db.execute(select(Branch).where(Branch.id == branch_id))
        branch = result.scalar_one_or_none()
        if not branch:
            raise NotFoundException("Branch not found.")
        return branch

    async def update_branch(self, db: AsyncSession, branch_id: str, data: BranchUpdateSchema) -> Branch:
        """Update branch fields."""
        branch = await self.get_branch(db, branch_id)
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(branch, field, value)
        db.add(branch)
        await db.flush()
        return branch

    # ── Branch Suspend / Reactivate / Delete ──────────────────────────────────

    async def get_suspended_branches(self, db: AsyncSession, company_id: str) -> list[Branch]:
        """Return suspended (inactive) branches for a company — used by the admin
        UI to list and reactivate them."""
        result = await db.execute(
            select(Branch).where(Branch.company_id == company_id, Branch.is_active == False)
        )
        return result.scalars().all()

    async def suspend_branch(
        self, db: AsyncSession, branch_id: str, admin_id: str, admin_password: str
    ) -> Branch:
        """
        Suspend a branch (admin-password protected).
        Sets the branch inactive AND disables login for every user account tied
        to one of the branch's ACTIVE employees. Data is preserved.
        """
        await self._verify_admin(db, admin_id, admin_password)
        branch = await self.get_branch(db, branch_id)
        if not branch.is_active:
            raise BadRequestException("Branch is already suspended.")

        emp_result = await db.execute(
            select(Employee).where(
                Employee.branch_id == branch_id,
                Employee.is_active == True,
                Employee.user_id.isnot(None),
            )
        )
        for emp in emp_result.scalars().all():
            user_res = await db.execute(select(User).where(User.id == emp.user_id))
            user = user_res.scalar_one_or_none()
            if user and user.is_active:
                user.is_active = False
                db.add(user)

        branch.is_active = False
        db.add(branch)
        await db.flush()
        return branch

    async def reactivate_branch(
        self, db: AsyncSession, branch_id: str, admin_id: str, admin_password: str
    ) -> Branch:
        """
        Reactivate a suspended branch (admin-password protected).
        Re-enables login ONLY for users tied to employees who are still active —
        employees terminated before/independently of the suspension stay disabled.
        NOTE: a branch cannot be reactivated while its parent company is suspended;
        reactivate the company first.
        """
        await self._verify_admin(db, admin_id, admin_password)
        branch = await self.get_branch(db, branch_id)
        if branch.is_active:
            raise BadRequestException("Branch is already active.")

        # Guard: do not reactivate a branch whose parent company is suspended.
        company = await self.get_company(db, branch.company_id)
        if not company.is_active:
            raise BadRequestException(
                "Cannot reactivate a branch while its company is suspended. Reactivate the company first."
            )

        emp_result = await db.execute(
            select(Employee).where(
                Employee.branch_id == branch_id,
                Employee.is_active == True,
                Employee.user_id.isnot(None),
            )
        )
        for emp in emp_result.scalars().all():
            user_res = await db.execute(select(User).where(User.id == emp.user_id))
            user = user_res.scalar_one_or_none()
            if user and not user.is_active:
                user.is_active = True
                db.add(user)

        branch.is_active = True
        db.add(branch)
        await db.flush()
        return branch

    async def delete_branch(
        self, db: AsyncSession, branch_id: str, admin_id: str, admin_password: str
    ) -> None:
        """
        Hard-delete a branch (admin-password protected).
        Permitted ONLY when the branch has NO employees (active or inactive) —
        protects against any data loss. Otherwise the caller must suspend instead.
        """
        await self._verify_admin(db, admin_id, admin_password)
        branch = await self.get_branch(db, branch_id)

        emp_res = await db.execute(
            select(Employee).where(Employee.branch_id == branch_id)
        )
        if emp_res.scalars().first():
            raise BadRequestException(
                "Cannot delete a branch that still has employees. Suspend it instead."
            )

        await db.delete(branch)
        await db.flush()

company_service = CompanyService()
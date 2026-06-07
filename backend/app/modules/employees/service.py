"""
app/modules/employees/service.py

Business logic for Employee module.

Key rules:
  - Employee can exist without a user account (no system access needed)
  - If create_user_account=True, a User is created and linked via user_id
  - Email uniqueness is checked across active employees
  - Terminating an employee sets is_active=False and termination_date
  - Terminated employee's user account is also deactivated
  - Historical data (timeclock, payroll) is never deleted
  - hire_date cannot be in the future (create & update)
"""

import uuid
from datetime import datetime, timezone, date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.modules.employees.models import Employee, ContractType
from app.modules.employees.schemas import EmployeeCreateSchema, EmployeeUpdateSchema
from app.modules.auth.models import User, UserRole
from app.core.security import hash_password, verify_password
from app.core.exceptions import BadRequestException, NotFoundException


class EmployeeService:

    # -- Create ---------------------------------------------------------------

    async def create_employee(self, db: AsyncSession, data: EmployeeCreateSchema) -> Employee:
        """
        Create a new employee profile.
        Optionally creates a linked User account for system access.
        """

        # Gelecek tarihli ise giris kabul edilmez.
        if data.hire_date and data.hire_date > date.today():
            raise BadRequestException("Ise giris tarihi gelecekte olamaz.")

        # Check email uniqueness among active employees
        if data.email:
            existing = await db.execute(
                select(Employee).where(
                    Employee.email == data.email,
                    Employee.is_active == True,
                )
            )
            if existing.scalar_one_or_none():
                raise BadRequestException("An active employee with this email already exists.")

        user_id = None

        # Create user account if requested
        if data.create_user_account:
            if not data.email:
                raise BadRequestException("Email is required to create a system account.")
            if not data.password:
                raise BadRequestException("Password is required to create a system account.")
            if len(data.password) < 8:
                raise BadRequestException("Password must be at least 8 characters.")

            # Check if user account already exists
            existing_user = await db.execute(
                select(User).where(User.email == data.email)
            )
            existing_user = existing_user.scalar_one_or_none()

            if existing_user:
                # If this user is already linked to an employee, block -- prevents
                # the unique-constraint crash on employees.user_id.
                linked = await db.execute(
                    select(Employee).where(Employee.user_id == existing_user.id)
                )
                if linked.scalar_one_or_none():
                    raise BadRequestException(
                        "A user account with this email is already linked to an employee. "
                        "If this is a former employee returning, use the rehire (reactivate) flow instead."
                    )
                if existing_user.is_active:
                    raise BadRequestException("A user account with this email already exists.")
                # Reactivate existing user
                existing_user.is_active = True
                existing_user.first_name = data.first_name
                existing_user.last_name = data.last_name
                existing_user.role = UserRole(data.role)
                existing_user.hashed_password = hash_password(data.password)
                db.add(existing_user)
                user_id = existing_user.id
            else:
                try:
                    role = UserRole(data.role)
                except ValueError:
                    raise BadRequestException(f"Invalid role: {data.role}.")

                new_user = User(
                    id=str(uuid.uuid4()),
                    first_name=data.first_name,
                    last_name=data.last_name,
                    email=data.email,
                    hashed_password=hash_password(data.password),
                    phone=data.phone,
                    role=role,
                    is_active=True,
                )
                db.add(new_user)
                await db.flush()
                user_id = new_user.id

        employee = Employee(
            id=str(uuid.uuid4()),
            user_id=user_id,
            company_id=data.company_id,
            branch_id=data.branch_id,
            first_name=data.first_name,
            last_name=data.last_name,
            email=data.email,
            phone=data.phone,
            tc_no=data.tc_no,
            sgk_no=data.sgk_no,
            hire_date=data.hire_date,
            contract_type=data.contract_type,
            position=data.position,
            department=data.department,
            base_salary=data.base_salary,
            bank_iban=data.bank_iban,
            is_active=True,
        )
        db.add(employee)
        await db.flush()
        return employee

    # -- Read -----------------------------------------------------------------

    async def get_employees_by_branch(self, db: AsyncSession, branch_id: str) -> list[Employee]:
        """Return all active employees for a branch."""
        result = await db.execute(
            select(Employee)
            .where(Employee.branch_id == branch_id, Employee.is_active == True)
            .order_by(Employee.first_name)
        )
        return result.scalars().all()

    async def get_inactive_by_branch(self, db: AsyncSession, branch_id: str) -> list[Employee]:
        """Return terminated (inactive) employees for a branch -- used by the
        rehire flow so admins can bring back former staff."""
        result = await db.execute(
            select(Employee)
            .where(Employee.branch_id == branch_id, Employee.is_active == False)
            .order_by(Employee.termination_date.desc())
        )
        return result.scalars().all()

    async def get_employees_by_company(self, db: AsyncSession, company_id: str) -> list[Employee]:
        """Return all active employees for a company."""
        result = await db.execute(
            select(Employee)
            .where(Employee.company_id == company_id, Employee.is_active == True)
            .order_by(Employee.first_name)
        )
        return result.scalars().all()

    async def get_employee(self, db: AsyncSession, employee_id: str) -> Employee:
        """Return a single employee by ID."""
        result = await db.execute(
            select(Employee).where(Employee.id == employee_id)
        )
        employee = result.scalar_one_or_none()
        if not employee:
            raise NotFoundException("Employee not found.")
        return employee

    async def get_by_user_id(self, db: AsyncSession, user_id: str) -> Employee:
        """
        Resolve the employee profile linked to a user account.
        Used after login so the employee portal can load the correct profile
        (shifts, leaves, documents all key off employee.id, not user.id).
        """
        result = await db.execute(
            select(Employee).where(
                Employee.user_id == user_id,
                Employee.is_active == True,
            )
        )
        employee = result.scalar_one_or_none()
        if not employee:
            raise NotFoundException("No employee profile linked to this account.")
        return employee

    # -- Update ---------------------------------------------------------------

    async def update_employee(
        self, db: AsyncSession, employee_id: str, data: EmployeeUpdateSchema
    ) -> Employee:
        """Update employee profile fields."""
        employee = await self.get_employee(db, employee_id)
        if data.hire_date and data.hire_date > date.today():
            raise BadRequestException("Ise giris tarihi gelecekte olamaz.")
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(employee, field, value)
        db.add(employee)
        await db.flush()
        return employee

    # -- Terminate ------------------------------------------------------------

    async def terminate_employee(
        self,
        db: AsyncSession,
        employee_id: str,
        admin_id: str,
        admin_password: str,
    ) -> None:
        """
        Terminate an employee with admin password verification.
        - Sets employee is_active = False
        - Sets termination_date = today
        - Deactivates linked user account if exists
        - Preserves all historical data
        """
        # Verify admin password
        admin_result = await db.execute(select(User).where(User.id == admin_id))
        admin = admin_result.scalar_one_or_none()
        if not admin:
            raise NotFoundException("Admin user not found.")
        if not verify_password(admin_password, admin.hashed_password):
            raise BadRequestException("Incorrect admin password.")

        employee = await self.get_employee(db, employee_id)

        # Prevent terminating already terminated employee
        if not employee.is_active:
            raise BadRequestException("Employee is already terminated.")

        # Deactivate linked user account
        if employee.user_id:
            user_result = await db.execute(
                select(User).where(User.id == employee.user_id)
            )
            user = user_result.scalar_one_or_none()
            if user:
                user.is_active = False
                db.add(user)

        employee.is_active = False
        employee.termination_date = date.today()
        db.add(employee)
        await db.flush()

    # -- Reactivate (Rehire) --------------------------------------------------

    async def reactivate_employee(
        self, db: AsyncSession, employee_id: str
    ) -> Employee:
        """
        Reactivate (rehire) a terminated employee.

        Guards against conflicts before bringing the profile back:
          - The employee must currently be inactive.
          - No OTHER active employee may already hold this email (would create a
            duplicate active identity in the same branch/company).
          - If the employee has a linked user account, no OTHER active user may
            hold that email either -- protects the auth-layer uniqueness.

        On success, the employee and its linked user account are re-enabled and
        the termination_date is cleared.
        """
        employee = await self.get_employee(db, employee_id)
        if employee.is_active:
            raise BadRequestException("Employee is already active.")

        # Conflict check 1: another ACTIVE employee with the same email
        if employee.email:
            clash = await db.execute(
                select(Employee).where(
                    Employee.email == employee.email,
                    Employee.is_active == True,
                    Employee.id != employee.id,
                )
            )
            if clash.scalar_one_or_none():
                raise BadRequestException(
                    "Another active employee already uses this email. "
                    "Resolve the conflict before rehiring."
                )

        # Conflict check 2: another ACTIVE user (different account) with same email
        if employee.email:
            user_clash = await db.execute(
                select(User).where(
                    User.email == employee.email,
                    User.is_active == True,
                    User.id != (employee.user_id or ""),
                )
            )
            if user_clash.scalar_one_or_none():
                raise BadRequestException(
                    "Another active login account already uses this email. "
                    "Resolve the conflict before rehiring."
                )

        employee.is_active = True
        employee.termination_date = None

        # Reactivate linked user account
        if employee.user_id:
            user_result = await db.execute(
                select(User).where(User.id == employee.user_id)
            )
            user = user_result.scalar_one_or_none()
            if user:
                user.is_active = True
                db.add(user)

        db.add(employee)
        await db.flush()
        return employee


employee_service = EmployeeService()

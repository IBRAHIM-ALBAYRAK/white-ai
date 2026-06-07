"""fix shift_assignments fk to employees

Revision ID: 3aff068a92d3
Revises: 90a2c84ca6d5
Create Date: 2026-06-07 11:07:03.701392

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3aff068a92d3'
down_revision: Union[str, Sequence[str], None] = '90a2c84ca6d5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Eski kuralı kaldır (employee_id -> users), doğrusunu ekle (employee_id -> employees)
    op.drop_constraint('shift_assignments_employee_id_fkey', 'shift_assignments', type_='foreignkey')
    op.create_foreign_key(
        'shift_assignments_employee_id_fkey',
        'shift_assignments', 'employees',
        ['employee_id'], ['id'],
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Geri al: tekrar users'a bağla
    op.drop_constraint('shift_assignments_employee_id_fkey', 'shift_assignments', type_='foreignkey')
    op.create_foreign_key(
        'shift_assignments_employee_id_fkey',
        'shift_assignments', 'users',
        ['employee_id'], ['id'],
    )
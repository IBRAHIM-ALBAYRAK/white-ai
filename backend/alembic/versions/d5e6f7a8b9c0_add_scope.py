"""add scope to finance_categories (nullable, no default)

Revision ID: d5e6f7a8b9c0
Revises: c3d4e5a6b7c8
"""
from alembic import op
import sqlalchemy as sa

revision = "d5e6f7a8b9c0"
down_revision = "b7f2a1c9d3e4"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("finance_categories", sa.Column("scope", sa.String(length=10), nullable=True))


def downgrade():
    op.drop_column("finance_categories", "scope")

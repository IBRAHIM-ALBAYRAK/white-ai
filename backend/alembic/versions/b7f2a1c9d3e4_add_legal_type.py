"""add legal_type to companies

Revision ID: b7f2a1c9d3e4
Revises: 96f09c525cd7
"""
from alembic import op
import sqlalchemy as sa

revision = "b7f2a1c9d3e4"
down_revision = "96f09c525cd7"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("companies", sa.Column("legal_type", sa.String(length=20), nullable=False, server_default="limited"))


def downgrade():
    op.drop_column("companies", "legal_type")

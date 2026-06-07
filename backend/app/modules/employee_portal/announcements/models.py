"""
app/modules/employee_portal/announcements/models.py

================================================================================
ANNOUNCEMENTS MODEL — Employee Portal
================================================================================

WHAT THIS FILE DOES:
    Defines the database model for company/branch announcements — the internal
    news feed employees see in their portal. Managers post announcements; all
    targeted employees read them. Think of it as a one-way broadcast board
    (manager → employees), not a chat.

WHERE IT LIVES:
    app/modules/employee_portal/
        ├── leaves/          (leave requests — DONE)
        ├── announcements/   ← YOU ARE HERE (company/branch news feed)
        ├── documents/       (employee document center)
        └── shift_swaps/     (shift exchange requests)

TARGETING MODEL:
    An announcement is always scoped to a company. It can optionally be narrowed
    to a single branch:
        - branch_id IS NULL  → company-wide (everyone in the company sees it)
        - branch_id IS SET   → only that branch's employees see it

    This lets a company owner post "Bayram tatili" to everyone, while a branch
    manager posts "Yalı Şubesi bu hafta erken kapanıyor" to just their branch.

VISIBILITY (is_active):
    Announcements are soft-managed. Instead of deleting, a manager toggles
    is_active = False to hide an old announcement. The row stays as a record.
    published_at marks when it went live (for sorting newest-first).

KEY RELATIONSHIPS:
    company_id  → companies.id   (required — every announcement belongs to a company)
    branch_id   → branches.id    (optional — null means company-wide)
    created_by  → users.id       (which manager/admin posted it)

    created_by is a User (not Employee) because only people with system login
    access — managers, owners, admins — can post announcements.
================================================================================
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime, Text, ForeignKey
)
from app.core.database import Base


class Announcement(Base):
    """
    A single announcement / news post shown to employees in their portal.

    One company has many announcements over time. Each is either company-wide
    (branch_id = null) or branch-specific (branch_id set).
    """
    __tablename__ = "announcements"

    id            = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # --- Targeting (who sees it) ---
    company_id    = Column(String, ForeignKey("companies.id"), nullable=False)   # Required scope
    branch_id     = Column(String, ForeignKey("branches.id"), nullable=True)     # Null = company-wide

    # --- Content ---
    title         = Column(String, nullable=False)         # Short headline
    content       = Column(Text, nullable=False)           # Full announcement body

    # --- Authorship ---
    created_by    = Column(String, ForeignKey("users.id"), nullable=False)  # Manager who posted

    # --- Visibility ---
    is_active     = Column(Boolean, default=True, nullable=False)  # False = hidden, not deleted
    published_at  = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # --- Timestamps ---
    created_at    = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at    = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
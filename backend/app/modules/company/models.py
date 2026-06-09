"""
app/modules/company/models.py

Defines the Company and Branch database tables.
WHITE.AI is a multi-tenant platform — multiple businesses use the same system.
Every piece of data (shifts, stock, time logs) is linked to a Branch.
Company and Branch are the foundation all other modules build upon.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Company(Base):
    __tablename__ = "companies"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    # Yasal şirket adı (örn. "Nevada Coffee Gıda A.Ş."). Sadece marka için dolu;
    # franchise/standalone için null kalabilir. name = görünen/marka adı.
    legal_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # "brand" (marka sahibi), "sub" (alt şirket: kendi şube veya franchise), "standalone" (tek başına)
    company_type: Mapped[str] = mapped_column(String(20), nullable=False, default="standalone")
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    address: Mapped[str] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    branches: Mapped[list["Branch"]] = relationship("Branch", back_populates="company")

class Branch(Base):
    __tablename__ = "branches"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id: Mapped[str] = mapped_column(String, ForeignKey("companies.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str] = mapped_column(String(500), nullable=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    latitude: Mapped[float] = mapped_column(nullable=True)
    longitude: Mapped[float] = mapped_column(nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    company: Mapped["Company"] = relationship("Company", back_populates="branches")


class OversightLink(Base):
    """
    Denetim bağı: bir marka company'sinin, bir alt şirketi (kendi şubesi veya
    franchise) hangi yetkiyle gördüğünü tanımlar.
      link_type = "full"      -> marka kendi şubesi; her şeyi görür + değiştirir (bordro dahil)
      link_type = "franchise" -> ayrı tüzel kişilik; marka bordro hariç görür,
                                 stoğa müdahale eder, çalışan/vardiyada öneri verir
    """
    __tablename__ = "oversight_links"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    brand_company_id: Mapped[str] = mapped_column(String, ForeignKey("companies.id"), nullable=False)
    sub_company_id: Mapped[str] = mapped_column(String, ForeignKey("companies.id"), nullable=False)
    link_type: Mapped[str] = mapped_column(String(20), nullable=False, default="franchise")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
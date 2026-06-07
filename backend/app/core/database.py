"""
app/core/database.py

Manages the async PostgreSQL connection using SQLAlchemy.
SQLAlchemy allows writing Python objects instead of raw SQL queries.
Async engine ensures the app is never blocked while waiting for database responses,
allowing thousands of concurrent requests to be handled simultaneously.
Each API request opens its own session via 'get_db' and closes it when done.
pool_pre_ping checks the connection health before each session to avoid dead connections.
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
)

# Session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Base model class
class Base(DeclarativeBase):
    pass

# Dependency — used in routers
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
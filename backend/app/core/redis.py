"""
app/core/redis.py

Redis is an in-memory data store used for fast temporary data access.
Unlike PostgreSQL which writes to disk, Redis keeps data in RAM.
In WHITE.AI, Redis handles two responsibilities:
  - JWT token blacklisting: invalidates tokens immediately on logout.
  - Caching: stores frequently accessed data to reduce PostgreSQL load.
"""

import redis.asyncio as aioredis
from app.core.config import settings

# Create async Redis client
redis_client = aioredis.from_url(
    settings.REDIS_URL,
    encoding="utf-8",
    decode_responses=True,
)

async def get_redis() -> aioredis.Redis:
    return redis_client
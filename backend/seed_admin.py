import asyncio
import uuid
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.modules.auth.models import User, UserRole

# FK'lerin çözülebilmesi için TÜM modeller metadata'ya kayıtlı olmalı
from app.modules.company import models as _company           # noqa: F401
from app.modules.workforce import models as _workforce       # noqa: F401
from app.modules.inventory import models as _inventory       # noqa: F401
from app.modules.timeclock import models as _timeclock       # noqa: F401
from app.modules.employees import models as _employees       # noqa: F401
from app.modules.employee_portal.leaves import models as _leaves               # noqa: F401
from app.modules.employee_portal.announcements import models as _announcements # noqa: F401
from app.modules.employee_portal.documents import models as _documents         # noqa: F401
from app.modules.employee_portal.shift_swaps import models as _swaps           # noqa: F401

# >>> kendi bilgilerin
ADMIN_EMAIL = "superadmin@whiteai.com"
ADMIN_PASSWORD = "Linux.446744"
ADMIN_FIRST = "Ibrahim"
ADMIN_LAST = "Albayrak"

async def seed():
    async with AsyncSessionLocal() as db:
        existing = await db.execute(select(User).where(User.email == ADMIN_EMAIL))
        if existing.scalar_one_or_none():
            print(f"{ADMIN_EMAIL} zaten var, atlaniyor.")
            return
        admin = User(
            id=str(uuid.uuid4()),
            first_name=ADMIN_FIRST,
            last_name=ADMIN_LAST,
            email=ADMIN_EMAIL,
            hashed_password=hash_password(ADMIN_PASSWORD),
            role=UserRole.SUPERADMIN,
            is_active=True,
        )
        db.add(admin)
        await db.commit()
        print(f"Superadmin olusturuldu: {ADMIN_EMAIL}")

if __name__ == "__main__":
    asyncio.run(seed())

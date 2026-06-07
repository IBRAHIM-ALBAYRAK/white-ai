"""
app/main.py

Entry point of the WHITE.AI backend application.
Initializes the FastAPI app, registers all module routers,
and manages startup and shutdown events.
All API routes are collected here under a single application instance.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.core.redis import get_redis

# --- Model imports (needed so create_all sees every table) ---
from app.modules.auth import models as auth_models
from app.modules.company import models as company_models
from app.modules.workforce import models as workforce_models
from app.modules.inventory import models as inventory_models
from app.modules.timeclock import models as timeclock_models
from app.modules.employees import models as employee_models
from app.modules.employee_portal.leaves import models as leaves_models
from app.modules.employee_portal.announcements import models as announcements_models
from app.modules.employee_portal.documents import models as documents_models
from app.modules.employee_portal.shift_swaps import models as shift_swaps_models
from app.modules.payroll import models as payroll_models

# --- Router imports ---
from app.modules.auth.router import router as auth_router
from app.modules.company.router import router as company_router
from app.modules.workforce.router import router as workforce_router
from app.modules.inventory.router import router as inventory_router
from app.modules.timeclock.router import router as timeclock_router
from app.modules.users.router import router as users_router
from app.modules.employees.router import router as employees_router
from app.modules.employee_portal.leaves.router import router as leaves_router
from app.modules.employee_portal.announcements.router import router as announcements_router
from app.modules.employee_portal.documents.router import router as documents_router
from app.modules.employee_portal.shift_swaps.router import router as shift_swaps_router
from app.modules.payroll.router import router as payroll_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # NOTE: Schema is now managed by Alembic migrations, NOT create_all.
    # To apply schema changes run:  alembic upgrade head
    # create_all is intentionally disabled to avoid conflicting with migrations.
    yield
    await engine.dispose()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Blacklist middleware: iptal edilen (logout yapılmış) token'ları reddet ---
@app.middleware("http")
async def reject_blacklisted_tokens(request: Request, call_next):
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[len("Bearer "):]
        redis = await get_redis()
        if await redis.get(f"blacklist:{token}"):
            return JSONResponse(status_code=401, content={"detail": "Token has been revoked."})
    return await call_next(request)


# --- Core / admin routers ---
app.include_router(auth_router, prefix="/api/v1")
app.include_router(company_router, prefix="/api/v1")
app.include_router(workforce_router, prefix="/api/v1")
app.include_router(inventory_router, prefix="/api/v1")
app.include_router(timeclock_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(employees_router, prefix="/api/v1")

# --- Employee portal routers ---
app.include_router(leaves_router, prefix="/api/v1")
app.include_router(announcements_router, prefix="/api/v1")
app.include_router(documents_router, prefix="/api/v1")
app.include_router(shift_swaps_router, prefix="/api/v1")
app.include_router(payroll_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": f"{settings.APP_NAME} is running.", "version": settings.APP_VERSION}
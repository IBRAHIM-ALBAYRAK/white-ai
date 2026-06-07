"""
alembic/env.py

Alembic migration environment for WHITE.AI.

Key design decisions:
  - The app runs on an ASYNC driver (postgresql+asyncpg). Alembic, however, runs
    migrations SYNCHRONOUSLY — this is the standard professional setup because
    sync migrations are simpler and less error-prone. We therefore take the app's
    DATABASE_URL and swap the async driver (asyncpg) for the sync driver
    (psycopg2) just for migrations.
  - Every model module is imported below so that Base.metadata "sees" every table.
    If a model is not imported here, Alembic's autogenerate will think the table
    was deleted and try to DROP it. The import list MUST match app/main.py.
"""

from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# --- App imports: settings + Base + ALL models -----------------------------
from app.core.config import settings
from app.core.database import Base

# Import every model module so its tables are registered on Base.metadata.
# This list mirrors app/main.py exactly — keep them in sync.
from app.modules.auth import models as auth_models            # noqa: F401
from app.modules.company import models as company_models      # noqa: F401
from app.modules.workforce import models as workforce_models  # noqa: F401
from app.modules.inventory import models as inventory_models  # noqa: F401
from app.modules.timeclock import models as timeclock_models  # noqa: F401
from app.modules.employees import models as employee_models   # noqa: F401
from app.modules.employee_portal.leaves import models as leaves_models                # noqa: F401
from app.modules.employee_portal.announcements import models as announcements_models  # noqa: F401
from app.modules.employee_portal.documents import models as documents_models          # noqa: F401
from app.modules.employee_portal.shift_swaps import models as shift_swaps_models      # noqa: F401

# Alembic Config object (reads alembic.ini).
config = context.config

# Swap the async driver for the sync one (asyncpg -> psycopg2) for migrations.
sync_url = settings.DATABASE_URL.replace("+asyncpg", "+psycopg2")
config.set_main_option("sqlalchemy.url", sync_url)

# Logging setup from alembic.ini.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Target metadata for 'autogenerate'.
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (emit SQL to a script, no DB connection)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode (connect to the DB and apply)."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
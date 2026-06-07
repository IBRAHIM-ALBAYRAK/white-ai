"""
seed_payroll.py

Seeds 2026 Turkish payroll parameters into the date-versioned tables.
Run once after migrations:  python3 seed_payroll.py
Idempotent: clears the three tables first, then inserts the 2026 rows.

SOURCES (verified Jun 2026):
  - Asgari ücret 2026: brüt 33.030,00 / net 28.075,50 / günlük brüt 1.101,00
  - SGK işçi %14, işsizlik işçi %1, SGK işveren %21,75 (2026: +1 puan),
    işsizlik işveren %2, damga binde 7,59, SGK tavan 297.270,00
  - Gelir vergisi tarifesi (ücret): GVK Md.103 + 332 Seri No'lu Tebliğ
  - Damga vergisi: 71 Seri No'lu Tebliğ
MUST be re-verified by a mali müşavir before production use.
"""

import asyncio
from datetime import date
from app.core.database import AsyncSessionLocal
# Import all models so metadata/relationships resolve cleanly.
from app.modules.payroll.models import MinimumWage, PayrollRate, IncomeTaxBracket
from sqlalchemy import delete

FROM = date(2026, 1, 1)
TO = date(2026, 12, 31)


async def seed():
    async with AsyncSessionLocal() as db:
        # Idempotent: wipe existing 2026 param rows first.
        await db.execute(delete(IncomeTaxBracket))
        await db.execute(delete(PayrollRate))
        await db.execute(delete(MinimumWage))

        # --- Minimum wage 2026 ---
        db.add(MinimumWage(
            period_code="ASG_2026_01",
            gross_monthly=33030.00,
            net_monthly=28075.50,
            gross_daily=1101.00,
            effective_from=FROM,
            effective_to=TO,
            note="2026 tam yil (ara zam yok)",
        ))

        # --- Scalar rates & limits 2026 ---
        rates = {
            "sgk_isci": 0.14,
            "issizlik_isci": 0.01,
            "sgk_isveren": 0.2175,       # 2026: 1 puan artirildi (5510 Md.81)
            "issizlik_isveren": 0.02,
            "damga": 0.00759,
            "sgk_tavan": 297270.00,      # brut asgari ucretin 9 kati
        }
        for key, val in rates.items():
            db.add(PayrollRate(
                rate_key=key, rate_value=val,
                effective_from=FROM, effective_to=TO,
            ))

        # --- Income tax brackets 2026 (wage earners) ---
        # (order, cumulative_min, cumulative_max, rate, fixed_amount)
        brackets = [
            (1, 0,         190000,   0.15, 0),
            (2, 190000,    400000,   0.20, 28500),
            (3, 400000,    1500000,  0.27, 70500),
            (4, 1500000,   5300000,  0.35, 367500),
            (5, 5300000,   None,     0.40, 1697500),
        ]
        for order, cmin, cmax, rate, fixed in brackets:
            db.add(IncomeTaxBracket(
                bracket_order=order,
                cumulative_min=cmin,
                cumulative_max=cmax,
                rate=rate,
                fixed_amount=fixed,
                effective_from=FROM, effective_to=TO,
            ))

        await db.commit()
        print("OK: 2026 payroll parameters seeded.")


if __name__ == "__main__":
    asyncio.run(seed())

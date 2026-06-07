"""test_payroll.py — engine sanity checks (full month + partial hire month)."""
from app.modules.payroll.engine import calculate_monthly_payslip

RATES = {
    "sgk_isci": 0.14, "issizlik_isci": 0.01,
    "sgk_isveren": 0.2175, "issizlik_isveren": 0.02,
    "damga": 0.00759, "sgk_tavan": 297270.00,
}
BRACKETS = [
    {"cumulative_min": 0,       "cumulative_max": 190000,  "rate": 0.15, "fixed_amount": 0},
    {"cumulative_min": 190000,  "cumulative_max": 400000,  "rate": 0.20, "fixed_amount": 28500},
    {"cumulative_min": 400000,  "cumulative_max": 1500000, "rate": 0.27, "fixed_amount": 70500},
    {"cumulative_min": 1500000, "cumulative_max": 5300000, "rate": 0.35, "fixed_amount": 367500},
    {"cumulative_min": 5300000, "cumulative_max": None,    "rate": 0.40, "fixed_amount": 1697500},
]
MW = 33030.00

def show(title, r):
    print(f"\n=== {title} ===")
    for k, v in r.as_dict().items():
        print(f"  {k:28} {v:>14,.2f}" if isinstance(v, float) else f"  {k:28} {v:>14}")

# TEST 1 — Asgari ucret, tam ay (30 gun) — net 28.075,50 PASS olmali (eski mantik korundu mu?)
r1 = calculate_monthly_payslip(gross=33030.00, prior_cumulative_base=0, rates=RATES,
    min_wage_gross=MW, brackets=BRACKETS, min_wage_prior_cumulative_base=0, sgk_days=30)
show("Asgari ucret - tam ay (net 28.075,50 beklenen)", r1)
print(f"  >>> {'PASS' if abs(r1.net_salary - 28075.50) < 0.5 else 'FAIL'}")

# TEST 2 — 50.000 brut, tam ay (onceki testle ayni cikmali: net 40.207,52)
r2 = calculate_monthly_payslip(gross=50000.00, prior_cumulative_base=0, rates=RATES,
    min_wage_gross=MW, brackets=BRACKETS, min_wage_prior_cumulative_base=0, sgk_days=30)
show("50.000 brut - tam ay (net 40.207,52 beklenen)", r2)
print(f"  >>> {'PASS' if abs(r2.net_salary - 40207.52) < 0.5 else 'FAIL'}")

# TEST 3 — KIST AY: 50.000 brut, 10 Nisan girisi -> 30-(10-1)=21 gun, ilk ay (kumulatif 0)
r3 = calculate_monthly_payslip(gross=50000.00, prior_cumulative_base=0, rates=RATES,
    min_wage_gross=MW, brackets=BRACKETS, min_wage_prior_cumulative_base=0, sgk_days=21)
show("50.000 brut - 10 Nisan girisi (21 gun kist)", r3)
print(f"  beklenen brut (paid) = 50000*21/30 = {50000*21/30:,.2f}")

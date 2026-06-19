"""
app/modules/payroll/engine.py

PURE payroll calculation engine. No DB, no FastAPI, no I/O.

V1 SCOPE: monthly-salaried, full-time. Supports PARTIAL months via sgk_days
(1..30) for the hire month. Full month = 30 days. No overtime, bonuses, SGDP,
incentives. Single employer.

PARTIAL-MONTH RULE (Turkey, SGK "parmak hesabı"):
  - Full month is always 30 SGK days regardless of calendar length.
  - Hire mid-month: sgk_days = calendar_days_in_month - (hire_day - 1), capped 30.
  - Maktu (monthly) wage is prorated by sgk_days/30. The minimum-wage exemptions
    (income tax + stamp) are prorated by the SAME sgk_days/30, because in a
    partial month the reference minimum wage is also worked the same days.

All money uses Decimal; rounded to 2 dp at the end.
"""

from decimal import Decimal, ROUND_HALF_UP
from dataclasses import dataclass, asdict


def _d(x) -> Decimal:
    return Decimal(str(x))


def _round2(x: Decimal) -> Decimal:
    return x.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def progressive_tax(cumulative_base, brackets: list[dict]) -> Decimal:
    """Total income tax on a CUMULATIVE base across progressive brackets."""
    base = _d(cumulative_base)
    if base <= 0:
        return Decimal("0")
    for b in brackets:
        cmin = _d(b["cumulative_min"])
        cmax = b["cumulative_max"]
        within_upper = (cmax is None) or (base <= _d(cmax))
        if base > cmin and within_upper:
            return _d(b["fixed_amount"]) + (base - cmin) * _d(b["rate"])
    top = brackets[-1]
    return _d(top["fixed_amount"]) + (base - _d(top["cumulative_min"])) * _d(top["rate"])


@dataclass
class PayslipResult:
    gross: float                   # prorated gross actually paid this month
    sgk_days: int
    full_monthly_gross: float      # the contractual monthly gross (before proration)
    sgk_base: float
    sgk_employee: float
    unemployment_employee: float
    income_tax_base: float
    cumulative_base_before: float
    cumulative_base_after: float
    mw_cumulative_base_after: float
    income_tax_gross: float
    income_tax_exemption: float
    income_tax_net: float
    stamp_tax_gross: float
    stamp_tax_exemption: float
    stamp_tax_net: float
    net_salary: float
    sgk_employer: float
    unemployment_employer: float
    employer_cost: float

    def as_dict(self):
        return asdict(self)


def calculate_monthly_payslip(
    *,
    gross: float,                          # contractual FULL monthly gross
    prior_cumulative_base: float,
    rates: dict,
    min_wage_gross: float,                 # full monthly minimum wage gross
    brackets: list[dict],
    min_wage_prior_cumulative_base: float,
    sgk_days: int = 30,                    # 30 = full month; <30 = partial (hire month)
) -> PayslipResult:
    """
    Calculate one month's payslip. For a partial month, pass sgk_days < 30; both
    the wage and the minimum-wage exemptions are prorated by sgk_days/30.
    """
    days = _d(sgk_days)
    factor = days / _d(30)

    full_monthly = _d(gross)
    g = full_monthly * factor                       # prorated gross paid this month

    tavan = _d(rates["sgk_tavan"])
    sgk_base = g if g <= tavan else tavan

    sgk_emp = sgk_base * _d(rates["sgk_isci"])
    unemp_emp = sgk_base * _d(rates["issizlik_isci"])

    it_base = g - sgk_emp - unemp_emp
    cum_before = _d(prior_cumulative_base)
    cum_after = cum_before + it_base
    it_gross = progressive_tax(cum_after, brackets) - progressive_tax(cum_before, brackets)

    # --- Minimum-wage exemption, prorated by the SAME factor ---
    mw_full = _d(min_wage_gross)
    mw_g = mw_full * factor
    mw_sgk = mw_g * _d(rates["sgk_isci"])
    mw_unemp = mw_g * _d(rates["issizlik_isci"])
    mw_it_base = mw_g - mw_sgk - mw_unemp
    mw_cum_before = _d(min_wage_prior_cumulative_base)
    mw_cum_after = mw_cum_before + mw_it_base
    it_exemption = progressive_tax(mw_cum_after, brackets) - progressive_tax(mw_cum_before, brackets)

    it_net = it_gross - it_exemption
    if it_net < 0:
        it_net = Decimal("0")

    stamp_gross = g * _d(rates["damga"])
    stamp_exemption = mw_g * _d(rates["damga"])
    stamp_net = stamp_gross - stamp_exemption
    if stamp_net < 0:
        stamp_net = Decimal("0")

    net = g - sgk_emp - unemp_emp - it_net - stamp_net

    sgk_employer = sgk_base * _d(rates["sgk_isveren"])
    unemp_employer = sgk_base * _d(rates["issizlik_isveren"])
    employer_cost = g + sgk_employer + unemp_employer

    return PayslipResult(
        gross=float(_round2(g)),
        sgk_days=int(sgk_days),
        full_monthly_gross=float(_round2(full_monthly)),
        sgk_base=float(_round2(sgk_base)),
        sgk_employee=float(_round2(sgk_emp)),
        unemployment_employee=float(_round2(unemp_emp)),
        income_tax_base=float(_round2(it_base)),
        cumulative_base_before=float(_round2(cum_before)),
        cumulative_base_after=float(_round2(cum_after)),
        mw_cumulative_base_after=float(_round2(mw_cum_after)),
        income_tax_gross=float(_round2(it_gross)),
        income_tax_exemption=float(_round2(it_exemption)),
        income_tax_net=float(_round2(it_net)),
        stamp_tax_gross=float(_round2(stamp_gross)),
        stamp_tax_exemption=float(_round2(stamp_exemption)),
        stamp_tax_net=float(_round2(stamp_net)),
        net_salary=float(_round2(net)),
        sgk_employer=float(_round2(sgk_employer)),
        unemployment_employer=float(_round2(unemp_employer)),
        employer_cost=float(_round2(employer_cost)),
    )

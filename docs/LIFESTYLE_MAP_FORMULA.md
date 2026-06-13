# Lifestyle Map — conversion formula (canonical reference)

Single source of truth for the calculator's funnel math. Implemented in
[`src/lib/lifestyleMath.mjs`](../src/lib/lifestyleMath.mjs) (`computeFunnel`),
consumed by `src/pages/lifestyle-calculator.astro`, and guarded at build time
by [`scripts/verify-lifestyle-math.mjs`](../scripts/verify-lifestyle-math.mjs)
(runs in `prebuild`; `npm run verify:calc` to run standalone).

## Formula

```
sales / month     = target ÷ price
sales / week      = (sales / month) ÷ 4.33          # standard weeks per month
warm leads / week = (sales / week)  ÷ 20%   (× 5)   # lead → sale
cold people / week= (warm leads/wk) ÷ 1%    (× 100) # stranger → lead
                                                    # chained cold → close = 0.2% (× 500)
```

- Weekly figures are **exact** (no `ceil`). Display: sales/week and warm
  leads/week to **2 decimals**; cold people/week rounded to a whole person;
  sales/month whole when integer, else 2 decimals.
- Conversion rates are user-adjustable; defaults are **20%** (warm→close) and
  **1%** (cold→warm). The reference table below uses the defaults.
- The horizon (Turtle 36 / Car 18 / Rocket 9 months) drives only the **phase
  roadmap timeline**, not the conversion math (months cancel in the per-week
  figures).

## Master Reference Table (corrected, exact)

| Target / mo | Price | Sales / mo | Sales / wk | Warm leads / wk | Cold people / wk |
|---|---|---|---|---|---|
| $5,000 | $250 | 20 | 4.62 | 23.09 | 2,309 |
| $10,000 | $1,000 | 10 | 2.31 | 11.55 | 1,155 |
| $15,000 | $2,500 | 6 | 1.39 | 6.93 | 693 |
| $20,000 | $5,000 | 4 | 0.92 | 4.62 | 462 |
| $30,000 | $1,500 | 20 | 4.62 | 23.09 | 2,309 |
| $40,000 | $10,000 | 4 | 0.92 | 4.62 | 462 |
| $50,000 | $3,500 | 14.29 | 3.30 | 16.50 | 1,650 |
| $75,000 | $15,000 | 5 | 1.15 | 5.77 | 577 |
| $100,000 | $5,000 | 20 | 4.62 | 23.09 | 2,309 |
| $100,000 | $2,000 | 50 | 11.55 | 57.74 | 5,774 |

## Note on the original spec table

The BIZ source table listed the three **20-sales/month** rows ($5k/$250,
$30k/$1,500, $100k/$5,000) as **23.10 / 2,310**. Those came from rounding
sales/week to `4.62` *before* multiplying (`4.62 × 5 = 23.10`). The exact
values are **23.09 / 2,309** (`100 ÷ 4.33 = 23.0947`), which is what the spec's
own stated rule — *"monthly figures are divided by 4.33"* — produces, and which
is consistent with every other row (e.g. Example 3's `6.93`, not `6.95`). The
calculator and this table use the exact (round-last) values.

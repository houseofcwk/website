/**
 * Build-time guard: verify the Lifestyle Map conversion formula against the
 * BIZ "Master Reference Table for Code Verification". Imports the SAME module
 * the calculator page uses (src/lib/lifestyleMath.mjs), so any drift in the
 * shipped formula fails the build (wired into `prebuild`).
 *
 * Expected values are the EXACT (round-last) results, matching the spec's
 * stated rule "monthly figures are divided by 4.33". The spec table's
 * 20-sales/month rows print 23.10 / 2,310 (from rounding sales/week to 4.62
 * first); the mathematically exact values are 23.09 / 2,309 — used here.
 */
import { computeFunnel } from '../src/lib/lifestyleMath.mjs';

const f2 = (n) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const f0 = (n) => new Intl.NumberFormat('en-US').format(Math.round(n));
const fSales = (n) => (Number.isInteger(n) ? String(n) : f2(n));

// [target, price, salesPerMonth, salesPerWeek, leadsPerWeek, coldPeoplePerWeek]
const TABLE = [
  [5000, 250, '20', '4.62', '23.09', '2,309'],
  [10000, 1000, '10', '2.31', '11.55', '1,155'],
  [15000, 2500, '6', '1.39', '6.93', '693'],
  [20000, 5000, '4', '0.92', '4.62', '462'],
  [30000, 1500, '20', '4.62', '23.09', '2,309'],
  [40000, 10000, '4', '0.92', '4.62', '462'],
  [50000, 3500, '14.29', '3.30', '16.50', '1,650'],
  [75000, 15000, '5', '1.15', '5.77', '577'],
  [100000, 5000, '20', '4.62', '23.09', '2,309'],
  [100000, 2000, '50', '11.55', '57.74', '5,774'],
];

let failures = 0;
for (const [target, price, eSpm, eSpw, eLpw, eCpw] of TABLE) {
  const r = computeFunnel({ target, price });
  const got = [fSales(r.salesPerMonth), f2(r.salesPerWeek), f2(r.leadsPerWeek), f0(r.strangersPerWeek)];
  const exp = [eSpm, eSpw, eLpw, eCpw];
  for (let i = 0; i < exp.length; i += 1) {
    if (got[i] !== exp[i]) {
      failures += 1;
      console.error(
        `✗ $${target}/$${price} col${i}: got ${got[i]} expected ${exp[i]}`,
      );
    }
  }
}

if (failures > 0) {
  console.error(`\n[verify-lifestyle-math] ${failures} mismatch(es) — formula drifted from the reference table.`);
  process.exit(1);
}
console.log(`[verify-lifestyle-math] OK — ${TABLE.length}/${TABLE.length} reference cases match.`);

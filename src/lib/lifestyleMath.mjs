/**
 * Lifestyle Map — conversion math (single source of truth).
 *
 * Matches the BIZ "Master Reference Table for Code Verification". Kept as a
 * standalone .mjs so BOTH the calculator page and the build-time verifier
 * (scripts/verify-lifestyle-math.mjs) import the SAME implementation — the
 * formula cannot drift from the reference table without the build failing.
 *
 *   sales / month    = target / price
 *   sales / week     = sales/month / 4.33      (standard weeks per month)
 *   warm leads / wk  = sales/week / (lead→sale %)   default 20%  → ×5
 *   cold people / wk = leads/week / (stranger→lead %) default 1% → ×100
 *                      (chained: cold→close = 0.2% → ×500)
 *
 * Figures are exact (no ceil). The spec's stated rule — "monthly figures are
 * divided by 4.33" — is round-last, which is what this produces. (The spec
 * table's 20-sales/month rows show 23.10 / 2,310 from rounding sales/week to
 * 4.62 first; the exact values are 23.09 / 2,309. See docs/LIFESTYLE_MAP_FORMULA.md.)
 */

export const WEEKS_PER_MONTH = 4.33;

/**
 * @param {{ target: number, price: number, strangerToLeadPct?: number, leadToSalePct?: number }} input
 * @returns {{ salesPerMonth: number, salesPerWeek: number, leadsPerWeek: number, strangersPerWeek: number }}
 */
export function computeFunnel({ target, price, strangerToLeadPct = 1, leadToSalePct = 20 }) {
  const salesPerMonth = target / Math.max(1, price);
  const salesPerWeek = salesPerMonth / WEEKS_PER_MONTH;
  const leadsPerWeek = salesPerWeek / Math.max(0.0001, leadToSalePct / 100);
  const strangersPerWeek = leadsPerWeek / Math.max(0.0001, strangerToLeadPct / 100);
  return { salesPerMonth, salesPerWeek, leadsPerWeek, strangersPerWeek };
}

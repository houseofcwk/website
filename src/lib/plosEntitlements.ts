/**
 * PLOS entitlements client — EPIC auth-monetization (#218).
 *
 * Feature-keyed gating + Stripe checkout against the PLOS API. Reusable by any
 * gated CWK page: pass a feature key (e.g. 'lifestyle-calculator').
 */
import { PLOS_BASE } from './plosAuth';

/** Active feature keys for the signed-in user (empty when unauthenticated). */
export async function getFeatures(): Promise<string[]> {
  try {
    const res = await fetch(`${PLOS_BASE}/api/v1/entitlements`, { credentials: 'include' });
    if (!res.ok) return [];
    const data = (await res.json()) as { features?: string[] };
    return Array.isArray(data.features) ? data.features : [];
  } catch {
    return [];
  }
}

export async function hasFeature(featureKey: string): Promise<boolean> {
  const features = await getFeatures();
  return features.includes(featureKey);
}

export interface GatedProductInfo {
  slug: string;
  name: string;
  description: string | null;
  amount: string | number | null;
  currency: string;
  billingMode: string;
}

/** The active product gating a feature (for the paywall UI). Null if none. */
export async function getProductByFeature(featureKey: string): Promise<GatedProductInfo | null> {
  try {
    const res = await fetch(
      `${PLOS_BASE}/api/v1/gated-products/by-feature/${encodeURIComponent(featureKey)}`,
      { credentials: 'include' },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { product?: GatedProductInfo | null };
    return data.product ?? null;
  } catch {
    return null;
  }
}

export interface CheckoutResult {
  url?: string;
  entitled?: boolean;
  error?: string;
}

/** Start a Stripe Checkout for a product; caller redirects to `url`. */
export async function startCheckout(
  productSlug: string,
  returnUrl: string,
): Promise<CheckoutResult> {
  try {
    const res = await fetch(`${PLOS_BASE}/api/v1/checkout`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productSlug, returnUrl }),
    });
    const data = (await res.json().catch(() => ({}))) as CheckoutResult;
    if (!res.ok) return { error: data.error ?? `error_${res.status}` };
    return data;
  } catch {
    return { error: 'network' };
  }
}

export interface ClaimResult {
  ok?: boolean;
  entitled?: boolean;
  error?: string;
}

/**
 * Payment-first auto-login: after Stripe redirects back with a session id,
 * claim it — the server provisions/finds the buyer, grants the entitlement,
 * and sets the shared session cookie. Returns once the cookie is set.
 */
export async function claimCheckout(sessionId: string): Promise<ClaimResult> {
  try {
    const res = await fetch(`${PLOS_BASE}/api/account/claim-checkout`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    return (await res.json().catch(() => ({}))) as ClaimResult;
  } catch {
    return { error: 'network' };
  }
}

/** Format a price for display (best-effort). */
export function formatPrice(amount: string | number | null, currency: string): string {
  if (amount == null || amount === '') return '';
  const n = Number(amount);
  if (Number.isNaN(n)) return String(amount);
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n);
  } catch {
    return `${currency} ${n}`;
  }
}

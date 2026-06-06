/**
 * Reusable feature gate — EPIC auth-monetization (#220).
 *
 * Model: one free run per browser (tracked in localStorage), then a one-time
 * payment unlocks the feature for good. Paid entitlement is server-authoritative
 * (PLOS), so a logged-in payer is never blocked even after clearing storage.
 *
 * Any gated CWK page reuses this by passing its own feature key.
 */
import { getFeatures } from './plosEntitlements';

export function freeRunKey(featureKey: string): string {
  return `cwk:gate:freeRunUsed:${featureKey}`;
}

export function isFreeRunUsed(featureKey: string): boolean {
  try {
    return localStorage.getItem(freeRunKey(featureKey)) === '1';
  } catch {
    return false;
  }
}

export function markFreeRunUsed(featureKey: string): void {
  try {
    localStorage.setItem(freeRunKey(featureKey), '1');
  } catch {
    /* storage unavailable — gate degrades to always-allow, acceptable */
  }
}

export interface GateState {
  /** Server-authoritative: user has paid for this feature. */
  entitled: boolean;
  /** This browser already consumed its free run. */
  freeRunUsed: boolean;
  /** True when the run must be paid for before use (free run spent, not paid). */
  blocked: boolean;
}

export async function evaluateGate(featureKey: string): Promise<GateState> {
  const features = await getFeatures();
  const entitled = features.includes(featureKey);
  const freeRunUsed = isFreeRunUsed(featureKey);
  return { entitled, freeRunUsed, blocked: !entitled && freeRunUsed };
}

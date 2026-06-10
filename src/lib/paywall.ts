/**
 * Reusable paywall modal — EPIC auth-monetization.
 *
 * Builds the "Unlock …" modal, handles close (×, Esc, backdrop), and on unlock
 * routes to login (if signed out) then Stripe checkout. Used by the gated
 * product's landing page. Styles live in src/styles/paywall.css.
 */
import { getProductByFeature, startCheckout, formatPrice } from './plosEntitlements';
import { track } from './analytics';

export interface PaywallOptions {
  /** Feature key used to look up price + entitlement (e.g. 'lifestyle-calculator'). */
  featureKey: string;
  /** Catalog product slug to check out. */
  productSlug: string;
  /** Absolute URL Stripe returns to after a successful payment (the gated app). */
  returnUrl: string;
  /** Where /login should send the user back to (defaults to the current page). */
  loginReturnUrl?: string;
  /** Modal copy overrides. */
  title?: string;
  subtitle?: string;
  /** Optional note line (e.g. "Checkout canceled"). */
  note?: string;
}

let keyHandler: ((e: KeyboardEvent) => void) | null = null;

function close(): void {
  const el = document.getElementById('lc-paywall');
  if (el) el.remove();
  if (keyHandler) document.removeEventListener('keydown', keyHandler);
  keyHandler = null;
  document.documentElement.style.overflow = '';
}

function setMsg(text: string): void {
  const el = document.getElementById('lc-unlock-msg');
  if (el) el.textContent = text;
}

export async function openPaywall(opts: PaywallOptions): Promise<void> {
  if (document.getElementById('lc-paywall')) return;

  const product = await getProductByFeature(opts.featureKey);
  const priceLabel = product ? formatPrice(product.amount, product.currency) : '';
  const priceHtml = priceLabel
    ? `<div class="lc-paywall-price">${priceLabel}<span> · one-time</span></div>`
    : '';
  const noteHtml = opts.note ? `<p class="lc-paywall-note">${opts.note}</p>` : '';

  const wrap = document.createElement('div');
  wrap.id = 'lc-paywall';
  wrap.className = 'lc-paywall';
  wrap.innerHTML = `
    <div class="lc-paywall-card" role="dialog" aria-modal="true" aria-labelledby="lc-paywall-title">
      <button type="button" id="lc-paywall-close" class="lc-paywall-close" aria-label="Close">&times;</button>
      <p class="lc-paywall-eyebrow">Lifestyle Calculator</p>
      <h2 id="lc-paywall-title" class="lc-paywall-h2">${opts.title ?? 'Unlock the Lifestyle Calculator'}</h2>
      <p class="lc-paywall-sub">${opts.subtitle ?? 'A one-time payment unlocks the full calculator — run every idea, as many times as you want, forever.'}</p>
      ${priceHtml}
      ${noteHtml}
      <button type="button" id="lc-unlock-btn" class="lc-paywall-cta">Unlock unlimited →</button>
      <p id="lc-unlock-msg" class="lc-paywall-msg"></p>
    </div>`;

  document.body.appendChild(wrap);
  document.documentElement.style.overflow = 'hidden';

  async function onUnlock(): Promise<void> {
    // Payment-first: go straight to Stripe. No login step — the account is
    // auto-created from the Stripe email and signed in on return.
    setMsg('Taking you to secure checkout…');
    track('lc_checkout_started', { feature: opts.featureKey });
    const res = await startCheckout(opts.productSlug, opts.returnUrl);
    if (res.entitled) {
      window.location.assign(opts.returnUrl);
      return;
    }
    if (res.url) {
      window.location.assign(res.url);
      return;
    }
    setMsg('Could not start checkout. Please try again.');
  }

  document.getElementById('lc-unlock-btn')?.addEventListener('click', () => void onUnlock());
  document.getElementById('lc-paywall-close')?.addEventListener('click', close);
  wrap.addEventListener('click', (e) => {
    if (e.target === wrap) close();
  });
  keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
  };
  document.addEventListener('keydown', keyHandler);
  track('lc_gate_shown', { feature: opts.featureKey });
}

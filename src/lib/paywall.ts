/**
 * Reusable paywall modal — EPIC auth-monetization.
 *
 * Builds the "Unlock …" modal, handles close (×, Esc, backdrop), and on unlock
 * routes to login (if signed out) then Stripe checkout. Used by the gated
 * product's landing page. Styles live in src/styles/paywall.css.
 */
import { getProductByFeature, startCheckout, formatPrice, hasFeature } from './plosEntitlements';
import { otpStart, otpVerify } from './plosAuth';
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

function setRestoreMsg(text: string): void {
  const el = document.getElementById('lc-restore-msg');
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
      <div class="lc-paywall-restore">
        <button type="button" id="lc-restore-link" class="lc-paywall-link">Already purchased? Sign in with email →</button>
        <form id="lc-restore-form" class="lc-restore-form" hidden>
          <p class="lc-restore-hint">Enter the email you bought with — we'll send a 6-digit code to unlock on this device.</p>
          <div class="lc-restore-row">
            <input id="lc-restore-email" type="email" inputmode="email" autocomplete="email" placeholder="you@email.com" class="lc-restore-input" />
            <button type="submit" id="lc-restore-send" class="lc-restore-btn">Send code</button>
          </div>
          <div id="lc-restore-coderow" class="lc-restore-row" hidden>
            <input id="lc-restore-code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="6-digit code" class="lc-restore-input" />
            <button type="button" id="lc-restore-verify" class="lc-restore-btn">Verify</button>
          </div>
          <p id="lc-restore-msg" class="lc-restore-msg"></p>
        </form>
      </div>
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

  // ── Restore an existing purchase on a new device via email OTP ──────────
  // Server-authoritative: verifying the code mints the shared session cookie,
  // then we check the entitlement on the server (works on any browser/device).
  let restoreEmail = '';

  async function onSendCode(e: Event): Promise<void> {
    e.preventDefault();
    const email = (document.getElementById('lc-restore-email') as HTMLInputElement | null)?.value.trim() ?? '';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setRestoreMsg('Enter a valid email address.');
      return;
    }
    restoreEmail = email;
    setRestoreMsg('Sending code…');
    track('lc_restore_started', { feature: opts.featureKey });
    await otpStart(email, 'code', opts.returnUrl);
    // Uniform response (no account enumeration) — always advance to code entry.
    document.getElementById('lc-restore-coderow')?.removeAttribute('hidden');
    (document.getElementById('lc-restore-code') as HTMLInputElement | null)?.focus();
    setRestoreMsg('We sent a 6-digit code to ' + email + '. Enter it above.');
  }

  async function onVerifyCode(): Promise<void> {
    const code = (document.getElementById('lc-restore-code') as HTMLInputElement | null)?.value.trim() ?? '';
    if (code.length < 6) {
      setRestoreMsg('Enter the 6-digit code.');
      return;
    }
    setRestoreMsg('Verifying…');
    const res = await otpVerify(restoreEmail, code);
    if (!res.ok) {
      setRestoreMsg("That code didn't work or has expired. Try again.");
      return;
    }
    // Logged in — now the entitlement check is server-authoritative.
    setRestoreMsg('Checking your purchase…');
    const entitled = await hasFeature(opts.featureKey);
    if (entitled) {
      track('lc_restore_unlocked', { feature: opts.featureKey });
      setRestoreMsg('Unlocked! Taking you in…');
      window.location.assign(opts.returnUrl);
      return;
    }
    track('lc_restore_no_purchase', { feature: opts.featureKey });
    setRestoreMsg("We couldn't find a purchase for " + restoreEmail + ". You can unlock above.");
  }

  document.getElementById('lc-restore-link')?.addEventListener('click', () => {
    document.getElementById('lc-restore-link')?.setAttribute('hidden', '');
    document.getElementById('lc-restore-form')?.removeAttribute('hidden');
    (document.getElementById('lc-restore-email') as HTMLInputElement | null)?.focus();
    track('lc_restore_shown', { feature: opts.featureKey });
  });
  document.getElementById('lc-restore-form')?.addEventListener('submit', (e) => void onSendCode(e));
  document.getElementById('lc-restore-verify')?.addEventListener('click', () => void onVerifyCode());

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

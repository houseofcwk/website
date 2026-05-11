// Universal event tracker per issue #197 + schema #198.
// One API → many provider adapters. Each adapter no-ops when its env vars are absent.

import type { EventProps, IdentityTraits, PageContext, Provider } from './analytics/types';
import { firebaseProvider } from './analytics/providers/firebase';
import { gtmProvider } from './analytics/providers/gtm';
import { mixpanelProvider } from './analytics/providers/mixpanel';
import { metaPixelProvider } from './analytics/providers/meta-pixel';
import { tiktokPixelProvider } from './analytics/providers/tiktok-pixel';
import { linkedinProvider } from './analytics/providers/linkedin';

const ANON_KEY = 'cwk:aid';
const USER_KEY = 'cwk:uid';

const PROVIDERS: Provider[] = [
  firebaseProvider,
  gtmProvider,
  mixpanelProvider,
  metaPixelProvider,
  tiktokPixelProvider,
  linkedinProvider,
];

let initialized = false;
let pageBootstrapped = false;
let anonymousId = '';
let userId = '';

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'aid_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function readStored(key: string): string {
  try {
    return localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

function writeStored(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* localStorage disabled */
  }
}

function isGpcOn(): boolean {
  return typeof navigator !== 'undefined' && (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}

function captureUtms(): Partial<PageContext> {
  if (typeof window === 'undefined') return {};
  const sp = new URLSearchParams(window.location.search);
  const out: Partial<PageContext> = {};
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const) {
    const v = sp.get(k);
    if (v) out[k] = v;
  }
  return out;
}

function currentPageContext(): PageContext {
  if (typeof window === 'undefined') {
    return { page_path: '', page_title: '', referrer_path: '' };
  }
  let referrer_path = '';
  try {
    referrer_path = document.referrer ? new URL(document.referrer).pathname : '';
  } catch {
    /* ignore */
  }
  return {
    page_path: window.location.pathname + window.location.search,
    page_title: document.title,
    referrer_path,
    ...captureUtms(),
  };
}

function withContext(props: EventProps): EventProps {
  const ctx = currentPageContext();
  return {
    page_path: ctx.page_path,
    page_title: ctx.page_title,
    referrer_path: ctx.referrer_path,
    anonymous_id: anonymousId,
    ...(userId ? { user_id: userId } : {}),
    client_ts: Date.now(),
    ...props,
  };
}

function fanOut(method: 'page' | 'identify' | 'track' | 'conversion', ...args: unknown[]): void {
  for (const p of PROVIDERS) {
    try {
      // @ts-expect-error variadic dispatcher
      p[method](...args);
    } catch (err) {
      if (typeof console !== 'undefined') console.warn(`[analytics] ${p.id}.${method} failed`, err);
    }
  }
}

export async function init(): Promise<void> {
  if (initialized || typeof window === 'undefined') return;
  if (isGpcOn()) {
    initialized = true;
    return;
  }
  anonymousId = readStored(ANON_KEY);
  if (!anonymousId) {
    anonymousId = uuid();
    writeStored(ANON_KEY, anonymousId);
  }
  userId = readStored(USER_KEY);
  await Promise.allSettled(PROVIDERS.map((p) => Promise.resolve(p.init())));
  initialized = true;
}

export function page(extra: EventProps = {}): void {
  if (typeof window === 'undefined') return;
  if (isGpcOn()) return;
  pageBootstrapped = true;
  const ctx = currentPageContext();
  for (const p of PROVIDERS) {
    try {
      p.page(ctx, { anonymous_id: anonymousId, ...(userId ? { user_id: userId } : {}), client_ts: Date.now(), ...extra });
    } catch (err) {
      if (typeof console !== 'undefined') console.warn(`[analytics] ${p.id}.page failed`, err);
    }
  }
}

export function identify(id: string, traits: IdentityTraits = {}): void {
  if (typeof window === 'undefined' || isGpcOn() || !id) return;
  userId = id;
  writeStored(USER_KEY, id);
  fanOut('identify', id, traits);
}

export function track(event: string, props: EventProps = {}): void {
  if (typeof window === 'undefined' || isGpcOn() || !event) return;
  if (!pageBootstrapped) pageBootstrapped = true;
  fanOut('track', event, withContext(props));
}

export function conversion(event: string, props: EventProps = {}): void {
  if (typeof window === 'undefined' || isGpcOn() || !event) return;
  fanOut('conversion', event, withContext(props));
}

export async function emailHash(email: string): Promise<string> {
  if (typeof window === 'undefined' || !email) return '';
  const normalized = email.trim().toLowerCase();
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalized));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    return '';
  }
}

export function getAnonymousId(): string {
  return anonymousId;
}

export function getUserId(): string {
  return userId;
}

export type { EventProps, IdentityTraits, PageContext } from './analytics/types';

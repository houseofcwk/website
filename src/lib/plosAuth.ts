/**
 * PLOS auth client — EPIC auth-monetization (#218).
 *
 * Thin wrappers over the PLOS account API (app.cwkexperience.com). All calls
 * are credentialed so the shared `.cwkexperience.com` session cookie rides
 * along (CWK and PLOS are same-site). Used by the CWK login/account UI.
 */

export const PLOS_BASE = (
  import.meta.env.PUBLIC_PLOS_BASE_URL ?? 'https://app.cwkexperience.com'
).replace(/\/$/, '');

export interface MeUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isAdmin: boolean;
  signupSource: string;
  workspaceId: string;
}

export interface MeResult {
  authenticated: boolean;
  user?: MeUser;
}

async function postJson<T>(path: string, body: unknown): Promise<{ status: number; data: T }> {
  const res = await fetch(`${PLOS_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T;
  return { status: res.status, data };
}

/** Current auth state via the shared cookie. */
export async function me(): Promise<MeResult> {
  try {
    const res = await fetch(`${PLOS_BASE}/api/account/me`, { credentials: 'include' });
    if (!res.ok) return { authenticated: false };
    return (await res.json()) as MeResult;
  } catch {
    return { authenticated: false };
  }
}

export type OtpMode = 'code' | 'link';

/** Request a 6-digit code or magic link. Always resolves (no enumeration). */
export async function otpStart(
  email: string,
  mode: OtpMode = 'code',
  returnUrl?: string,
): Promise<{ ok: boolean }> {
  const { status } = await postJson('/api/account/otp/start', { email, mode, returnUrl });
  return { ok: status === 200 };
}

export interface OtpVerifyResult {
  ok: boolean;
  isNew?: boolean;
  error?: string;
}

/** Verify a 6-digit code; on success the response sets the session cookie. */
export async function otpVerify(email: string, code: string): Promise<OtpVerifyResult> {
  const { status, data } = await postJson<{ ok?: boolean; isNew?: boolean; error?: string }>(
    '/api/account/otp/verify',
    { email, code },
  );
  if (status === 200 && data.ok) return { ok: true, isNew: data.isNew };
  return { ok: false, error: data.error ?? `error_${status}` };
}

/** URL that begins the Google OAuth flow (full redirect), returning to `returnUrl`. */
export function googleSignInUrl(returnUrl: string): string {
  const u = new URL(`${PLOS_BASE}/api/account/google-start`);
  u.searchParams.set('returnUrl', returnUrl);
  return u.toString();
}

export async function logout(): Promise<void> {
  await fetch(`${PLOS_BASE}/api/account/logout`, { method: 'POST', credentials: 'include' }).catch(
    () => undefined,
  );
}

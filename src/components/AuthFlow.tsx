import { useEffect, useMemo, useState } from 'react';
import { otpStart, otpVerify, googleSignInUrl, me } from '../lib/plosAuth';
import { track } from '../lib/analytics';

/**
 * AuthFlow — EPIC auth-monetization (#219).
 *
 * CWK-branded passwordless sign-in island used by /login. Email → 6-digit code
 * (in-page) or Continue with Google (full redirect). On success, redirects to
 * `returnUrl`. New emails are provisioned + flagged signup_source='cwk' by PLOS;
 * existing PLOS users sign into the same account.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const C = {
  bg: '#0B0E18',
  border: 'rgba(0,229,255,0.18)',
  text: '#EEF0FF',
  muted: '#A8A29E',
  cyan: '#00E5FF',
  violet: '#7B61FF',
  danger: '#FB3079',
};

function resolveReturnUrl(explicit?: string): string {
  if (explicit) return explicit;
  if (typeof window !== 'undefined') {
    const q = new URL(window.location.href).searchParams.get('return');
    if (q) return q;
  }
  return '/';
}

export default function AuthFlow({ returnUrl: returnUrlProp }: { returnUrl?: string }) {
  const returnUrl = useMemo(() => resolveReturnUrl(returnUrlProp), [returnUrlProp]);
  const [stage, setStage] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Already signed in? Skip straight to the return target.
  useEffect(() => {
    let alive = true;
    void me().then((r) => {
      if (alive && r.authenticated) window.location.assign(returnUrl);
    });
    return () => {
      alive = false;
    };
  }, [returnUrl]);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setMsg('Enter a valid email.');
      return;
    }
    setBusy(true);
    setMsg(null);
    await otpStart(email, 'code', returnUrl);
    track('cwk_auth_code_requested', {});
    setBusy(false);
    setStage('code');
    setMsg('We sent a 6-digit code. Check your inbox.');
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await otpVerify(email, code.trim());
    setBusy(false);
    if (res.ok) {
      track('cwk_auth_signed_in', { is_new: Boolean(res.isNew) });
      window.location.assign(returnUrl);
    } else {
      setMsg('That code is invalid or expired. Try again.');
    }
  }

  function continueWithGoogle() {
    track('cwk_auth_google_started', {});
    window.location.assign(googleSignInUrl(returnUrl));
  }

  return (
    <div
      style={{
        maxWidth: 420,
        margin: '0 auto',
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: '36px 32px',
        fontFamily:
          "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif",
        color: C.text,
      }}
    >
      <p
        style={{
          margin: '0 0 8px',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 2.5,
          textTransform: 'uppercase',
          color: C.cyan,
        }}
      >
        CWK · Sign in
      </p>
      <h1 style={{ margin: '0 0 18px', fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>
        {stage === 'email' ? 'Sign in or create your account' : 'Enter your code'}
      </h1>

      {stage === 'email' ? (
        <form onSubmit={requestCode}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            autoComplete="email"
            style={inputStyle}
            required
          />
          <button type="submit" disabled={busy} style={primaryBtn}>
            {busy ? 'Sending…' : 'Email me a code →'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
            <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: 11, color: C.muted }}>or</span>
            <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>
          <button type="button" onClick={continueWithGoogle} style={ghostBtn}>
            Continue with Google
          </button>
        </form>
      ) : (
        <form onSubmit={submitCode}>
          <input
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            autoComplete="one-time-code"
            style={{ ...inputStyle, letterSpacing: 8, fontSize: 20, textAlign: 'center' }}
            required
          />
          <button type="submit" disabled={busy || code.length < 6} style={primaryBtn}>
            {busy ? 'Verifying…' : 'Verify & continue →'}
          </button>
          <button
            type="button"
            onClick={() => {
              setStage('email');
              setCode('');
              setMsg(null);
            }}
            style={{ ...ghostBtn, marginTop: 10 }}
          >
            Use a different email
          </button>
        </form>
      )}

      {msg && <p style={{ margin: '14px 0 0', fontSize: 13, color: C.muted }}>{msg}</p>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: '#07090F',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  padding: '12px 14px',
  color: '#EEF0FF',
  fontSize: 15,
  marginBottom: 12,
};

const primaryBtn: React.CSSProperties = {
  width: '100%',
  background: `linear-gradient(90deg,${C.cyan},${C.violet})`,
  color: '#07090F',
  fontWeight: 700,
  fontSize: 14,
  border: 'none',
  borderRadius: 8,
  padding: '13px 0',
  cursor: 'pointer',
};

const ghostBtn: React.CSSProperties = {
  width: '100%',
  background: 'transparent',
  color: '#EEF0FF',
  fontWeight: 600,
  fontSize: 14,
  border: '1px solid rgba(255,255,255,0.16)',
  borderRadius: 8,
  padding: '12px 0',
  cursor: 'pointer',
};

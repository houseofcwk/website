import { useEffect, useRef, useState } from 'react';

type FormState = 'idle' | 'loading' | 'success' | 'error';

interface FieldErrors {
  name?: string;
  email?: string;
  company?: string;
  role?: string;
  topic?: string;
  message?: string;
  consent?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const API_BASE = import.meta.env.PUBLIC_API_BASE_URL ?? 'https://api.houseofcwk.com';
const TURNSTILE_SITE_KEY = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY as string | undefined;

const TOPIC_OPTIONS = [
  { value: 'general',     label: 'General enquiry' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'press',       label: 'Press' },
  { value: 'support',     label: 'Support' },
  { value: 'other',       label: 'Other' },
] as const;

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      getResponse: (id?: string) => string | undefined;
    };
  }
}

export default function ContactForm() {
  const [state, setState] = useState<FormState>('idle');
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const formRef = useRef<HTMLFormElement>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileIdRef = useRef<string | null>(null);
  const loadedAtRef = useRef<number>(Date.now());

  // Load Turnstile when a site key is configured.
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !turnstileContainerRef.current) return;

    const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);

    const renderWidget = () => {
      if (!window.turnstile || !turnstileContainerRef.current) return;
      turnstileIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'dark',
        appearance: 'always',
      });
    };

    if (existing) {
      if (window.turnstile) renderWidget();
      else existing.addEventListener('load', renderWidget, { once: true });
    } else {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.addEventListener('load', renderWidget, { once: true });
      document.head.appendChild(script);
    }
  }, []);

  function validateClient(data: Record<string, string>, consentChecked: boolean): FieldErrors {
    const errors: FieldErrors = {};
    if (!data.name || data.name.trim().length < 2) errors.name = 'Please enter your name.';
    if (!EMAIL_REGEX.test(data.email || '')) errors.email = 'Please enter a valid email address.';
    if (!TOPIC_OPTIONS.some((t) => t.value === data.topic)) errors.topic = 'Please choose a topic.';
    if (!data.message || data.message.trim().length < 20) {
      errors.message = 'Please share a bit more detail (20+ characters).';
    }
    if (!consentChecked) errors.consent = 'Please agree to the Privacy Policy.';
    return errors;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const form = e.currentTarget;
    const fd = new FormData(form);
    const data = {
      name:    String(fd.get('name')    ?? ''),
      email:   String(fd.get('email')   ?? '').trim().toLowerCase(),
      company: String(fd.get('company') ?? ''),
      role:    String(fd.get('role')    ?? ''),
      topic:   String(fd.get('topic')   ?? ''),
      message: String(fd.get('message') ?? ''),
      website_url: String(fd.get('website_url') ?? ''),
    };
    const consent = fd.get('consent') === 'on';

    // Honeypot — silently succeed.
    if (data.website_url.length > 0) {
      setState('success');
      return;
    }

    const errors = validateClient(data, consent);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const turnstileToken = TURNSTILE_SITE_KEY && window.turnstile
      ? window.turnstile.getResponse(turnstileIdRef.current ?? undefined) ?? ''
      : '';

    setState('loading');

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          consent,
          turnstileToken,
          loadedAt: loadedAtRef.current,
        }),
      });

      if (res.status === 200) {
        setState('success');
        return;
      }

      const payload = (await res.json().catch(() => ({}))) as {
        error?: string;
        fieldErrors?: FieldErrors;
      };

      if (res.status === 422 && payload.fieldErrors) {
        setFieldErrors(payload.fieldErrors);
        setState('idle');
        setFormError('Please fix the highlighted fields and try again.');
        return;
      }

      if (res.status === 429) {
        setState('error');
        setFormError('Too many submissions. Please try again later.');
        return;
      }

      if (payload.error === 'spam_rejected') {
        setState('error');
        setFormError("We couldn't process your submission. Please try again.");
        if (TURNSTILE_SITE_KEY && window.turnstile) {
          window.turnstile.reset(turnstileIdRef.current ?? undefined);
        }
        return;
      }

      setState('error');
      setFormError('Something went wrong. Please try again in a moment.');
    } catch {
      setState('error');
      setFormError('Network error. Please check your connection and try again.');
    }
  }

  if (state === 'success') {
    return (
      <div className="contact-success glass-card" role="status" aria-live="polite">
        <span className="contact-success-dot" />
        <h3>Message received.</h3>
        <p>
          Thanks for reaching out — we've got your note. Expect a reply within
          1–2 business days. If it's urgent, email{' '}
          <a href="mailto:hello@cwkexperience.com">hello@cwkexperience.com</a>.
        </p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      className="contact-form glass-card"
      action={`${API_BASE}/contact`}
      method="POST"
      onSubmit={handleSubmit}
      noValidate
    >
      {/* Honeypot */}
      <div className="contact-honeypot" aria-hidden="true">
        <label htmlFor="website_url">Website</label>
        <input type="text" id="website_url" name="website_url" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="contact-row">
        <Field
          label="Name"
          required
          htmlFor="contact-name"
          error={fieldErrors.name}
        >
          <input
            type="text"
            id="contact-name"
            name="name"
            autoComplete="name"
            minLength={2}
            maxLength={80}
            required
            aria-invalid={!!fieldErrors.name}
          />
        </Field>

        <Field
          label="Email"
          required
          htmlFor="contact-email"
          error={fieldErrors.email}
        >
          <input
            type="email"
            id="contact-email"
            name="email"
            autoComplete="email"
            maxLength={180}
            required
            aria-invalid={!!fieldErrors.email}
          />
        </Field>
      </div>

      <div className="contact-row">
        <Field label="Company" htmlFor="contact-company" error={fieldErrors.company}>
          <input
            type="text"
            id="contact-company"
            name="company"
            autoComplete="organization"
            maxLength={120}
          />
        </Field>

        <Field label="Role" htmlFor="contact-role" error={fieldErrors.role}>
          <input
            type="text"
            id="contact-role"
            name="role"
            autoComplete="organization-title"
            maxLength={80}
          />
        </Field>
      </div>

      <Field
        label="Topic"
        required
        htmlFor="contact-topic"
        error={fieldErrors.topic}
      >
        <select id="contact-topic" name="topic" required defaultValue="" aria-invalid={!!fieldErrors.topic}>
          <option value="" disabled>
            Choose one…
          </option>
          {TOPIC_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Message"
        required
        htmlFor="contact-message"
        error={fieldErrors.message}
        hint="20–2000 characters."
      >
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          minLength={20}
          maxLength={2000}
          required
          aria-invalid={!!fieldErrors.message}
        />
      </Field>

      <label className="contact-consent">
        <input type="checkbox" name="consent" required />
        <span>
          I agree to be contacted about my enquiry, per the{' '}
          <a href="/privacy">Privacy Policy</a>.
        </span>
      </label>
      {fieldErrors.consent && (
        <p className="contact-field-error" role="alert">
          {fieldErrors.consent}
        </p>
      )}

      {TURNSTILE_SITE_KEY && (
        <div className="contact-turnstile" ref={turnstileContainerRef} />
      )}

      <div className="contact-actions">
        <button
          type="submit"
          className="btn btn-gradient contact-submit"
          disabled={state === 'loading'}
        >
          {state === 'loading' ? <span className="contact-spinner" aria-hidden="true" /> : 'Send message →'}
        </button>
        <p className="contact-legal">
          Protected by Cloudflare Turnstile. Responses sent from{' '}
          <a href="mailto:hello@cwkexperience.com">hello@cwkexperience.com</a>.
        </p>
      </div>

      {formError && (
        <p className="contact-form-error" role="alert" aria-live="assertive">
          {formError}
        </p>
      )}
    </form>
  );
}

interface FieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

function Field({ label, htmlFor, required, error, hint, children }: FieldProps) {
  return (
    <div className={`contact-field${error ? ' contact-field-invalid' : ''}`}>
      <label htmlFor={htmlFor}>
        {label}
        {required && <span className="contact-required" aria-hidden="true"> *</span>}
        {!required && <span className="contact-optional"> (optional)</span>}
      </label>
      {children}
      {hint && !error && <p className="contact-field-hint">{hint}</p>}
      {error && (
        <p className="contact-field-error" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}

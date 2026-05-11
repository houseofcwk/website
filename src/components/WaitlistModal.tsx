import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import WaitlistForm from './WaitlistForm';
import { track } from '../lib/analytics';

export default function WaitlistModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [triggerSource, setTriggerSource] = useState<string>('');
  const openedAtRef = useRef<number>(0);

  useEffect(() => { setMounted(true); }, []);

  const open = useCallback((source: string) => {
    setTriggerSource(source);
    setIsOpen(true);
    openedAtRef.current = Date.now();
    document.body.style.overflow = 'hidden';
    track('waitlist_modal_opened', { trigger_source: source });
  }, []);

  const close = useCallback(() => {
    if (isOpen) {
      track('waitlist_modal_dismissed', {
        trigger_source: triggerSource,
        time_open_ms: Date.now() - openedAtRef.current,
      });
    }
    setIsOpen(false);
    document.body.style.overflow = '';
  }, [isOpen, triggerSource]);

  // Listen for custom event from Astro components
  useEffect(() => {
    const eventHandler = (e: Event) => {
      const detail = (e as CustomEvent<{ source?: string }>).detail;
      open(detail?.source ?? 'event_dispatch');
    };
    window.addEventListener('cwk:open-waitlist', eventHandler);
    return () => window.removeEventListener('cwk:open-waitlist', eventHandler);
  }, [open]);

  // Delegate clicks on any [data-open-waitlist] element anywhere in the DOM
  useEffect(() => {
    const clickHandler = (e: Event) => {
      const trigger = (e.target as HTMLElement).closest('[data-open-waitlist]') as HTMLElement | null;
      if (!trigger) return;
      const source = trigger.dataset.source || trigger.getAttribute('data-open-waitlist') || 'unknown';
      open(source);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [open]);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="wl-backdrop"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Join the waitlist"
    >
      <div className="wl-card" onClick={(e) => e.stopPropagation()}>
        <button className="wl-close" onClick={close} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="wl-content">
          <span className="wl-eyebrow">Early Access</span>
          <h2 className="wl-title">
            We're building something for builders &amp; creators who are done going at it alone.
          </h2>
          <p className="wl-sub">
            CWK. Agent+ is the operating system that manages your growth across Mind, Body, Soul, and Pocket. Join the waitlist to get early access when we launch.
          </p>
          <WaitlistForm surface="modal" triggerSource={triggerSource} />
          <p className="wl-footnote">
            🔑 This grants you exclusive access to the House of CWK. world.
          </p>
        </div>
      </div>

      <style>{`
        .wl-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9000;
          background: rgba(0, 0, 0, 0.72);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: wlFadeIn 0.2s ease both;
        }

        @keyframes wlFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .wl-card {
          position: relative;
          width: 100%;
          max-width: 520px;
          background: #0B0E18;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 48px 40px 40px;
          overflow: hidden;
          animation: wlSlideUp 0.28s cubic-bezier(0.34, 1.4, 0.64, 1) both;
        }

        /* Subtle ambient glow at top of card */
        .wl-card::before {
          content: '';
          position: absolute;
          top: -80px;
          left: 50%;
          transform: translateX(-50%);
          width: 320px;
          height: 240px;
          background: radial-gradient(circle, rgba(0, 229, 255, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        @keyframes wlSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }

        .wl-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          color: rgba(238, 240, 255, 0.6);
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          z-index: 1;
        }

        .wl-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #EEF0FF;
        }

        .wl-content {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 8px;
        }

        .wl-eyebrow {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          background: linear-gradient(90deg, #00E5FF, #7B61FF);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
          font-family: 'DM Sans', sans-serif;
        }

        .wl-title {
          font-size: clamp(24px, 4vw, 30px);
          font-weight: 800;
          color: #EEF0FF;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin: 0 0 4px;
          font-family: 'DM Sans', sans-serif;
        }

        .wl-sub {
          font-size: 15px;
          color: rgba(238, 240, 255, 0.62);
          max-width: 360px;
          line-height: 1.55;
          margin: 0 0 16px;
          font-family: 'DM Sans', sans-serif;
        }

        .wl-footnote {
          font-size: 13px;
          color: rgba(238, 240, 255, 0.55);
          line-height: 1.5;
          margin: 14px 0 0;
          font-family: 'DM Sans', sans-serif;
        }

        @media (max-width: 540px) {
          .wl-card { padding: 40px 20px 32px; }
          .wl-title { font-size: 22px; }
        }
      `}</style>
    </div>,
    document.body
  );
}

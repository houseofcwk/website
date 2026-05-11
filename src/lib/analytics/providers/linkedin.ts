import type { Provider } from '../types';
import { CONVERSIONS, isConversion } from '../conversions';

declare global {
  interface Window {
    _linkedin_partner_id?: string;
    _linkedin_data_partner_ids?: string[];
    lintrk?: ((cmd: string, opts?: Record<string, unknown>) => void) & { q?: unknown[] };
  }
}

const partnerId = (import.meta.env.PUBLIC_LINKEDIN_PARTNER_ID ?? '') as string;

export const linkedinProvider: Provider = {
  id: 'linkedin',
  isReady: () => Boolean(partnerId) && typeof window !== 'undefined' && typeof window.lintrk === 'function',
  init() {
    if (!partnerId || typeof window === 'undefined' || window.lintrk) return;
    window._linkedin_partner_id = partnerId;
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids ?? [];
    window._linkedin_data_partner_ids.push(partnerId);
    /* eslint-disable */
    (function (l: any) {
      if (!l) {
        (window as any).lintrk = function (a: string, b?: any) {
          (window as any).lintrk.q.push([a, b]);
        };
        (window as any).lintrk.q = [];
      }
      const s = document.getElementsByTagName('script')[0];
      const b = document.createElement('script');
      b.type = 'text/javascript';
      b.async = true;
      b.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
      s.parentNode!.insertBefore(b, s);
    })(window.lintrk);
    /* eslint-enable */
  },
  page() {
    /* LinkedIn Insight tag auto-fires PageView; no manual call needed. */
  },
  identify() {
    /* No client-side identify for LinkedIn. */
  },
  track() {
    /* LinkedIn only tracks conversion IDs (numeric), not generic events. */
  },
  conversion(event, props) {
    if (!this.isReady()) return;
    const map = isConversion(event) ? CONVERSIONS[event] : null;
    const conversionId = resolveConversionId(event);
    if (conversionId) {
      window.lintrk!('track', { conversion_id: conversionId });
      return;
    }
    if (map) window.lintrk!('track', { conversion_id: map.linkedin });
  },
};

function resolveConversionId(event: string): string | null {
  const map: Record<string, string | undefined> = {
    waitlist_submitted: import.meta.env.PUBLIC_LINKEDIN_CONVERSION_WAITLIST,
    lc_email_submitted: import.meta.env.PUBLIC_LINKEDIN_CONVERSION_LC_EMAIL,
    lc_path_a_clicked: import.meta.env.PUBLIC_LINKEDIN_CONVERSION_LC_TOUR,
    contact_submitted: import.meta.env.PUBLIC_LINKEDIN_CONVERSION_CONTACT,
    assessment_calendly_clicked: import.meta.env.PUBLIC_LINKEDIN_CONVERSION_ASSESSMENT_CALL,
    assessment_waitlist_clicked: import.meta.env.PUBLIC_LINKEDIN_CONVERSION_ASSESSMENT_WAITLIST,
    powerups_checkout_clicked: import.meta.env.PUBLIC_LINKEDIN_CONVERSION_POWERUPS_CHECKOUT,
  };
  return map[event] ?? null;
}

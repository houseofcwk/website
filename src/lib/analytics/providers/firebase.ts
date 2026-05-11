import { initFirebaseAnalytics, firebaseEnabled } from '../../firebase';
import { logEvent, setUserId, setUserProperties, type Analytics } from 'firebase/analytics';
import { CONVERSIONS, isConversion } from '../conversions';
import type { EventProps, IdentityTraits, PageContext, Provider } from '../types';

let analytics: Analytics | null = null;

function sanitize(props: EventProps): EventProps {
  const out: EventProps = {};
  for (const [k, v] of Object.entries(props)) {
    if (v === null || v === undefined) continue;
    out[k] = v;
  }
  return out;
}

export const firebaseProvider: Provider = {
  id: 'firebase',
  isReady: () => firebaseEnabled && analytics !== null,
  async init() {
    if (!firebaseEnabled) return;
    analytics = await initFirebaseAnalytics();
  },
  page(ctx, props = {}) {
    if (!analytics) return;
    logEvent(analytics, 'page_view', {
      page_location: typeof window !== 'undefined' ? window.location.href : '',
      page_path: ctx.page_path,
      page_title: ctx.page_title,
      ...sanitize(props),
    });
  },
  identify(userId, traits = {}) {
    if (!analytics) return;
    setUserId(analytics, userId);
    const clean = sanitize(traits as EventProps);
    if (Object.keys(clean).length > 0) {
      setUserProperties(analytics, clean as Record<string, string>);
    }
  },
  track(event, props) {
    if (!analytics) return;
    logEvent(analytics, event as string, sanitize(props));
  },
  conversion(event, props) {
    if (!analytics) return;
    const map = isConversion(event) ? CONVERSIONS[event] : null;
    const name = map?.ga4 ?? event;
    logEvent(analytics, name as string, sanitize(props));
  },
};

import type { Provider } from '../types';
import { CONVERSIONS, isConversion } from '../conversions';

const token = (import.meta.env.PUBLIC_MIXPANEL_TOKEN ?? '') as string;

type MixpanelLike = {
  init: (token: string, opts?: Record<string, unknown>) => void;
  identify: (id: string) => void;
  track: (event: string, props?: Record<string, unknown>) => void;
  people: { set: (traits: Record<string, unknown>) => void };
};

let mp: MixpanelLike | null = null;

export const mixpanelProvider: Provider = {
  id: 'mixpanel',
  isReady: () => Boolean(token) && mp !== null,
  async init() {
    if (!token || typeof window === 'undefined') return;
    const mod = await import('mixpanel-browser');
    mp = mod.default as unknown as MixpanelLike;
    mp.init(token, {
      track_pageview: false,
      persistence: 'localStorage',
      ignore_dnt: false,
    });
  },
  page(ctx, props = {}) {
    if (!mp) return;
    mp.track('page_view', { page_path: ctx.page_path, page_title: ctx.page_title, ...props });
  },
  identify(userId, traits = {}) {
    if (!mp) return;
    mp.identify(userId);
    if (Object.keys(traits).length > 0) mp.people.set(traits as Record<string, unknown>);
  },
  track(event, props) {
    if (!mp) return;
    mp.track(event, props);
  },
  conversion(event, props) {
    if (!mp) return;
    const map = isConversion(event) ? CONVERSIONS[event] : null;
    mp.track(event, { ...props, $conversion: true, conversion_label: map?.mixpanelLabel ?? event });
  },
};

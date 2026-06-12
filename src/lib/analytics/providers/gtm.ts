import { CONVERSIONS, isConversion } from '../conversions';
import { analyticsConfig } from '../config';
import type { Provider } from '../types';

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export const gtmProvider: Provider = {
  id: 'gtm',
  isReady() {
    return Boolean(analyticsConfig().gtmId) && typeof window !== 'undefined' && Array.isArray(window.dataLayer);
  },
  init() {
    if (typeof window === 'undefined') return;
    window.dataLayer = window.dataLayer ?? [];
  },
  page(ctx, props = {}) {
    if (!this.isReady()) return;
    window.dataLayer!.push({
      event: 'page_view',
      page_path: ctx.page_path,
      page_title: ctx.page_title,
      ...props,
    });
  },
  identify(userId, traits = {}) {
    if (!this.isReady()) return;
    window.dataLayer!.push({ event: 'identify', user_id: userId, ...traits });
  },
  track(event, props) {
    if (!this.isReady()) return;
    window.dataLayer!.push({ event, ...props });
  },
  conversion(event, props) {
    if (!this.isReady()) return;
    const map = isConversion(event) ? CONVERSIONS[event] : null;
    window.dataLayer!.push({
      event: map?.ga4 ?? event,
      conversion: true,
      conversion_name: event,
      ...props,
    });
  },
};

import type { Provider } from '../types';
import { CONVERSIONS, isConversion } from '../conversions';

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[] };
    _fbq?: unknown;
  }
}

const pixelId = (import.meta.env.PUBLIC_META_PIXEL_ID ?? '') as string;

export const metaPixelProvider: Provider = {
  id: 'meta_pixel',
  isReady: () => Boolean(pixelId) && typeof window !== 'undefined' && typeof window.fbq === 'function',
  init() {
    if (!pixelId || typeof window === 'undefined' || typeof window.fbq === 'function') return;
    /* eslint-disable */
    (function (f: any, b, e, v, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq!('init', pixelId);
  },
  page() {
    if (!this.isReady()) return;
    window.fbq!('track', 'PageView');
  },
  identify() {
    /* Meta uses Advanced Matching, not implemented client-side for privacy. */
  },
  track(event, props) {
    if (!this.isReady()) return;
    window.fbq!('trackCustom', event, props);
  },
  conversion(event, props) {
    if (!this.isReady()) return;
    const map = isConversion(event) ? CONVERSIONS[event] : null;
    if (map) window.fbq!('track', map.meta, props);
    else window.fbq!('trackCustom', event, props);
  },
};

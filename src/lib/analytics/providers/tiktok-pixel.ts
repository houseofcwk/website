import type { Provider } from '../types';
import { CONVERSIONS, isConversion } from '../conversions';
import { analyticsConfig } from '../config';

declare global {
  interface Window {
    ttq?: any;
    TiktokAnalyticsObject?: string;
  }
}

export const tiktokPixelProvider: Provider = {
  id: 'tiktok_pixel',
  isReady: () => Boolean(analyticsConfig().tiktokPixelId) && typeof window !== 'undefined' && Boolean(window.ttq),
  init() {
    const pixelId = analyticsConfig().tiktokPixelId;
    if (!pixelId || typeof window === 'undefined' || window.ttq) return;
    /* eslint-disable */
    (function (w: any, d: Document, t: string) {
      w.TiktokAnalyticsObject = t;
      const ttq: any = (w[t] = w[t] || []);
      ttq.methods = ['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie','holdConsent','revokeConsent','grantConsent'];
      ttq.setAndDefer = function (target: any, method: string) {
        target[method] = function () {
          target.push([method].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.instance = function (id: string) {
        const inst = ttq._i[id] || [];
        for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(inst, ttq.methods[i]);
        return inst;
      };
      ttq.load = function (id: string, p?: any) {
        const url = 'https://analytics.tiktok.com/i18n/pixel/events.js';
        ttq._i = ttq._i || {};
        ttq._i[id] = [];
        ttq._i[id]._u = url;
        ttq._t = ttq._t || {};
        ttq._t[id] = +new Date();
        ttq._o = ttq._o || {};
        ttq._o[id] = p || {};
        const script = d.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = url + '?sdkid=' + id + '&lib=' + t;
        const first = d.getElementsByTagName('script')[0];
        first.parentNode!.insertBefore(script, first);
      };
      ttq.load(pixelId);
      ttq.page();
    })(window, document, 'ttq');
    /* eslint-enable */
  },
  page() {
    if (!this.isReady()) return;
    window.ttq.page();
  },
  identify(userId) {
    if (!this.isReady()) return;
    window.ttq.identify({ external_id: userId });
  },
  track(event, props) {
    if (!this.isReady()) return;
    window.ttq.track(event, props);
  },
  conversion(event, props) {
    if (!this.isReady()) return;
    const map = isConversion(event) ? CONVERSIONS[event] : null;
    window.ttq.track(map?.tiktok ?? event, props);
  },
};

// Universal auto-binders per #198 §2.
// Wires scroll depth, outbound clicks, nav clicks, section views, and the
// [data-track-event] generic attribute so pages only need to add data attrs
// instead of manual event listeners.

import { track } from '../analytics';

const SITE_HOSTS = new Set(['cwkexperience.com', 'www.cwkexperience.com', 'houseofcwk.pages.dev', 'localhost', '127.0.0.1']);

export function bindUniversal(): void {
  if (typeof window === 'undefined') return;
  bindScrollDepth();
  bindLinkClicks();
  bindGenericTrackAttr();
  bindSectionViews();
}

function bindScrollDepth(): void {
  const thresholds = [25, 50, 75, 100];
  const fired = new Set<number>();
  const onScroll = () => {
    const doc = document.documentElement;
    const total = doc.scrollHeight - doc.clientHeight;
    if (total <= 0) return;
    const pct = Math.min(100, Math.round(((window.scrollY || doc.scrollTop) / total) * 100));
    for (const t of thresholds) {
      if (pct >= t && !fired.has(t)) {
        fired.add(t);
        track('scroll_depth_reached', { depth_pct: t });
      }
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

function locationOf(el: HTMLElement): string {
  if (el.closest('header, [data-loc="header"]')) return 'header';
  if (el.closest('footer, [data-loc="footer"]')) return 'footer';
  if (el.closest('[data-loc="mobile_overlay"]')) return 'mobile_overlay';
  if (el.dataset.cta) return 'cta';
  return 'body';
}

function bindLinkClicks(): void {
  document.addEventListener('click', (ev) => {
    const target = (ev.target as HTMLElement)?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!target) return;
    const href = target.getAttribute('href') ?? '';
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

    const location = locationOf(target);
    const label = (target.textContent ?? '').trim().slice(0, 80);

    let url: URL | null = null;
    try {
      url = new URL(href, window.location.origin);
    } catch {
      return;
    }
    const host = url.host.replace(/^www\./, '');
    const internal = SITE_HOSTS.has(host) || SITE_HOSTS.has(url.host) || url.origin === window.location.origin;

    if (location === 'header' || location === 'footer' || location === 'mobile_overlay') {
      track('nav_link_clicked', {
        link_label: label,
        link_href: href,
        location,
      });
    }

    if (!internal) {
      track('outbound_link_clicked', {
        href,
        host: url.host,
        text: label,
        location,
      });
    }
  });
}

function bindGenericTrackAttr(): void {
  // <button data-track-event="cta_clicked" data-evt-foo="bar"> auto-fires on click.
  document.addEventListener('click', (ev) => {
    const el = (ev.target as HTMLElement)?.closest?.('[data-track-event]') as HTMLElement | null;
    if (!el) return;
    const event = el.dataset.trackEvent;
    if (!event) return;
    const props: Record<string, string> = {};
    for (const [k, v] of Object.entries(el.dataset)) {
      if (k.startsWith('evt') && k !== 'evt' && v !== undefined) {
        const propKey = k.slice(3).replace(/[A-Z]/g, (m) => '_' + m.toLowerCase()).replace(/^_/, '');
        props[propKey] = v;
      }
    }
    track(event, props);
  });
}

function bindSectionViews(): void {
  if (!('IntersectionObserver' in window)) return;
  const els = document.querySelectorAll<HTMLElement>('[data-section-view]');
  if (els.length === 0) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const id = el.dataset.sectionView ?? '';
          const eventName = el.dataset.sectionEvent ?? 'section_viewed';
          if (id) track(eventName, { section_id: id, surface: window.location.pathname });
          io.unobserve(el);
        }
      }
    },
    { threshold: 0.5 },
  );
  els.forEach((el) => io.observe(el));
}

// Central analytics/ad-pixel config.
//
// IDs default to build-time env vars (PUBLIC_*), but can be overridden at
// runtime by setAnalyticsConfig() — Base.astro passes values pulled from the
// Sanity `siteSettings.analytics` group so marketing can manage pixels in
// Studio without code or Cloudflare access. Non-empty values win; blanks fall
// back to env. These IDs are PUBLIC (they ship to the browser anyway), so
// sourcing them from Sanity carries no secret-exposure risk.
//
// Providers read analyticsConfig() inside init()/isReady() (not at module
// load), so setAnalyticsConfig() must run BEFORE analytics init() — which it
// does in Base.astro.

export interface AnalyticsConfig {
  gtmId: string;
  metaPixelId: string;
  tiktokPixelId: string;
  linkedinPartnerId: string;
}

const envConfig: AnalyticsConfig = {
  gtmId: (import.meta.env.PUBLIC_GTM_ID ?? '') as string,
  metaPixelId: (import.meta.env.PUBLIC_META_PIXEL_ID ?? '') as string,
  tiktokPixelId: (import.meta.env.PUBLIC_TIKTOK_PIXEL_ID ?? '') as string,
  linkedinPartnerId: (import.meta.env.PUBLIC_LINKEDIN_PARTNER_ID ?? '') as string,
};

const overrides: Partial<AnalyticsConfig> = {};

/** Apply non-empty overrides (e.g. from Sanity). Blanks keep the env fallback. */
export function setAnalyticsConfig(cfg: Partial<AnalyticsConfig> | null | undefined): void {
  if (!cfg) return;
  (Object.keys(cfg) as (keyof AnalyticsConfig)[]).forEach((k) => {
    const v = cfg[k];
    if (typeof v === 'string' && v.trim()) overrides[k] = v.trim();
  });
}

export function analyticsConfig(): AnalyticsConfig {
  return { ...envConfig, ...overrides };
}

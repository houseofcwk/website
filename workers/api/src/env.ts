// Shared Env interface for the consolidated cwk-api worker.
// All bindings/vars are declared here; handlers pick what they need.

export interface Env {
  // KV namespaces
  WAITLIST: KVNamespace;
  CONTACTS: KVNamespace;
  RATE_LIMIT: KVNamespace;

  // Secrets (wrangler secret put …)
  RESEND_API?: string;
  // Player X-Ray micro-app flow (Omazy plugin-flow): HMAC secret for the
  // core→worker signature + the Core API token (per-install) for memory writes.
  XRAY_HMAC_SECRET?: string;
  CORE_API_TOKEN?: string;
  // Bearer token gating GET /agent/manifest. Unset disables the endpoint.
  AGENT_ADMIN_TOKEN?: string;
  TURNSTILE_SECRET?: string;
  HASH_SALT?: string;
  SLACK_WEBHOOK_URL?: string;
  GOOGLE_PLACES_KEY?: string;

  // Plain text vars (wrangler.toml)
  ENVIRONMENT: string;
  ALLOWED_ORIGIN: string;
  FROM_EMAIL: string;
  FROM_NAME: string;
  REPLY_TO_EMAIL: string;
  REPLY_TO_NAME: string;
  CONTACT_INBOX_TO: string;
  WAITLIST_INBOX_TO?: string;
  CWK_PLACE_ID?: string;

  // Agent config (Sanity Studio → runtime). Defaults are compiled into
  // lib/agentConfig.ts; these only exist to point a preview worker at a
  // different dataset or to retune the cache without a code change.
  SANITY_PROJECT_ID?: string;
  SANITY_DATASET?: string;
  /** Seconds the agent config is memoised per isolate. Default 60. */
  AGENT_CONFIG_TTL?: string;
}

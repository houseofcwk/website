// agentManifest — renders the Omazy install manifest from the live config, so
// the manifest is a generated artifact of the Studio rather than a JSON blob
// hand-maintained on the Omazy side.
//
//   GET /agent/manifest              → manifest as currently served (memoised)
//   GET /agent/manifest?fresh=1      → bypass the config memo, for verifying a
//                                      publish immediately instead of waiting
//                                      out the TTL
//   GET /agent/manifest?debug=1      → adds _source / _loadedAt / counts, to
//                                      tell "Sanity is serving this" apart from
//                                      "we fell back to the compiled config"
//
// Ops endpoint: requires AGENT_ADMIN_TOKEN. It leaks no secrets, but the tool
// descriptions are prompt-engineering work and there is no reason to serve them
// to the open internet.
import type { Env } from '../env';
import { getAgentConfig, buildManifest } from '../lib/agentConfig';
import { json } from '../omazy-sdk';

export async function handleAgentManifest(request: Request, env: Env): Promise<Response> {
  const token = (env as any).AGENT_ADMIN_TOKEN as string | undefined;
  if (!token) {
    return new Response(
      'AGENT_ADMIN_TOKEN is not set on this worker; /agent/manifest is disabled.',
      { status: 503 },
    );
  }
  const auth = request.headers.get('Authorization') || '';
  const presented = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  // Length check first so the compare below cannot early-exit on length alone.
  if (presented.length !== token.length) return new Response('unauthorized', { status: 401 });
  let diff = 0;
  for (let i = 0; i < token.length; i++) diff |= presented.charCodeAt(i) ^ token.charCodeAt(i);
  if (diff !== 0) return new Response('unauthorized', { status: 401 });

  const url = new URL(request.url);
  const cfg = await getAgentConfig(env, { fresh: url.searchParams.get('fresh') === '1' });
  const manifest = buildManifest(cfg);

  if (url.searchParams.get('debug') === '1') {
    return json({
      ...manifest,
      _source: cfg.source,
      _loadedAt: new Date(cfg.loadedAt).toISOString(),
      _flows: cfg.flows.map((f) => ({ key: f.key, enabled: f.enabled, steps: f.steps.length, archetypes: f.archetypes.length })),
      _tools: cfg.tools.map((t) => ({ name: t.name, enabled: t.enabled, inputs: t.inputs.length })),
    });
  }

  return json(manifest);
}

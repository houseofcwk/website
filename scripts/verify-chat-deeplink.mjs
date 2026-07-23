#!/usr/bin/env node
// Verify the ?chat= deep-link handler in src/layouts/Base.astro.
//
// This is the path printed QR codes depend on, and it is inline script in an
// .astro layout, so nothing else type-checks or exercises it. It also has one
// ordering constraint that is easy to break and silent when broken: the widget
// lazy-loads its iframe on first open and postToApp() has no queue, so the
// handler MUST register the `ready` listener before calling open. Reordering
// those two lines still "works" in review and drops the message in production.
//
// Runs in prebuild. Usage: npm run verify:deeplink

import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const src = readFileSync('src/layouts/Base.astro', 'utf8');
const start = src.indexOf('(function () {\n        try {\n          var params');
if (start < 0) {
  console.error('✗ deep-link handler not found in src/layouts/Base.astro');
  process.exit(1);
}
const code = src.slice(start, src.indexOf('})();', start) + '})();'.length);

function run(search) {
  const calls = [];
  const listeners = {};
  let replaced = null;
  const ctx = {
    location: { search, pathname: '/', hash: '' },
    history: { replaceState: (_a, _b, u) => { replaced = u; } },
    URLSearchParams,
    ouWidget: (cmd, a, b) => {
      calls.push(cmd);
      if (cmd === 'on') listeners[a] = b;
      // Simulate the app signalling ready only after the panel is opened.
      if (cmd === 'open' && listeners.ready) listeners.ready();
      if (cmd === 'startChat') calls.push({ message: a && a.message });
    },
  };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  const sent = calls.find((c) => typeof c === 'object');
  return { order: calls.filter((c) => typeof c === 'string'), message: sent ? sent.message : null, replaced };
}

const failures = [];
const check = (name, cond, detail) => { if (!cond) failures.push(`${name}: ${detail}`); };

// No param — the handler must be completely inert.
{
  const r = run('');
  check('no param', r.order.length === 0, `expected no widget calls, got [${r.order}]`);
  check('no param', r.replaced === null, 'must not rewrite the URL');
}

// Happy path, including the ordering constraint.
{
  const r = run('?chat=player+x-ray');
  check('simple', r.message === 'player x-ray', `got ${JSON.stringify(r.message)}`);
  check('ordering', r.order.indexOf('on') < r.order.indexOf('open'),
    `'on' must precede 'open' or the message is dropped — got [${r.order}]`);
  check('ordering', r.order.includes('startChat'), `startChat never fired — got [${r.order}]`);
}

// Percent-encoded spaces decode.
check('encoded', run('?chat=what%20player%20am%20i').message === 'what player am i', 'decode failed');

// Campaign params must survive; only ?chat is stripped.
{
  const r = run('?utm_source=flyer&chat=player+x-ray');
  check('utm kept', r.replaced === '/?utm_source=flyer', `got ${r.replaced}`);
}

// Empty / whitespace-only values are no-ops.
for (const s of ['?chat=', '?chat=%20%20%20']) {
  check('blank', run(s).order.length === 0, `${s} should be inert`);
}

// Control characters are stripped.
check('control chars', run('?chat=hi%00%1Fthere').message === 'hithere',
  `got ${JSON.stringify(run('?chat=hi%00%1Fthere').message)}`);

// Length is capped so a crafted link cannot inject a wall of text.
// Null-safe: when an earlier defect stops startChat firing at all, this must
// report a failure rather than throw and bury the real cause in a stack trace.
{
  const m = run('?chat=' + 'a'.repeat(500)).message;
  check('length cap', typeof m === 'string' && m.length === 120,
    m === null ? 'no message was sent at all' : `expected 120 chars, got ${m.length}`);
}

if (failures.length) {
  console.error(`✗ ${failures.length} deep-link check(s) failed:\n`);
  failures.forEach((f) => console.error(`  ${f}`));
  process.exit(1);
}
console.log('✓ ?chat= deep-link handler verified (8 checks, incl. ready-before-open ordering)');

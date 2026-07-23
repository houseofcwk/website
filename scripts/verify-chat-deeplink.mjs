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

// The [data-open-chat] binding must live in the layout, not in a component.
// It previously sat inside the homepage hero, so the attribute rendered on
// other pages with no listener attached: a dead button that throws no error and
// looks correct in the markup.
//
// Extract the delegated binder and actually fire a click through it — asserting
// the code is merely present would pass on a listener that never calls open.
{
  const bStart = src.indexOf('document.addEventListener("click"');
  if (bStart < 0) {
    failures.push('open-chat binder: Base.astro has no site-wide click binder for [data-open-chat]');
  } else {
    const binder = src.slice(bStart, src.indexOf('});', bStart) + '});'.length);
    const calls = [];
    let handler = null;
    const ctx = {
      document: { addEventListener: (evt, cb) => { if (evt === 'click') handler = cb; } },
      ouWidget: (cmd) => calls.push(cmd),
    };
    vm.createContext(ctx);
    vm.runInContext(binder, ctx);

    check('open-chat binder', typeof handler === 'function', 'no click handler was registered');

    if (handler) {
      // A click on (or inside) a [data-open-chat] element opens the chat.
      handler({ target: { closest: (sel) => (sel === '[data-open-chat]' ? {} : null) } });
      check('open-chat fires', calls.includes('open'),
        `clicking [data-open-chat] must call ouWidget('open') — got [${calls}]`);

      // A click anywhere else must not.
      const before = calls.length;
      handler({ target: { closest: () => null } });
      check('open-chat scoped', calls.length === before,
        'clicking outside [data-open-chat] must not open the chat');
    }
  }
}

if (failures.length) {
  console.error(`✗ ${failures.length} deep-link check(s) failed:\n`);
  failures.forEach((f) => console.error(`  ${f}`));
  process.exit(1);
}
console.log('✓ chat triggers verified (11 checks: ?chat= handler, ready-before-open ordering, [data-open-chat] binder)');

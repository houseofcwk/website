#!/usr/bin/env node
// Generate a QR code that opens the CWK chat agent with a starter message.
//
// The QR encodes a normal site URL carrying ?chat=<text>. The deep-link handler
// in src/layouts/Base.astro reads that param, opens the widget and sends the
// text as the visitor's first message — so scanning "player x-ray" drops them
// straight into the journey rather than on a page they still have to navigate.
//
// Every QR is DECODED BACK before being written. A QR that scans to the wrong
// URL is an expensive thing to discover on printed material, and encoders fail
// quietly at high error-correction levels with long payloads.
//
// Usage:
//   npm run qr -- --text "player x-ray"
//   npm run qr -- --text "player x-ray" --path / --label xray --out ../../resources/design/qr
//   npm run qr -- --url "https://cwkexperience.com/power-ups" --text "book a power up"

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback;
};

const SITE = arg('site', 'https://cwkexperience.com');
const TEXT = arg('text', 'player x-ray');
const PATH = arg('path', '/');
const LABEL = arg('label', TEXT.replace(/[^a-z0-9]+/gi, '-').toLowerCase());
const OUT = resolve(arg('out', '../../resources/design/qr'));
const SIZE = Number(arg('size', '1200'));

// CWK ink on white. Printed QR codes want maximum contrast — a mid-tone
// foreground is the most common reason a code fails to scan under bad light.
const DARK = arg('dark', '#07090F');
const LIGHT = arg('light', '#FFFFFF');

const url = new URL(PATH, SITE);
url.searchParams.set('chat', TEXT);
const target = url.toString();

// Error correction H tolerates ~30% damage — the right level for print, where
// codes get creased, smudged, or partially covered.
const opts = { errorCorrectionLevel: 'H', margin: 2, color: { dark: DARK, light: LIGHT } };

mkdirSync(OUT, { recursive: true });

const pngPath = join(OUT, `cwk-qr-${LABEL}.png`);
const svgPath = join(OUT, `cwk-qr-${LABEL}.svg`);

const pngBuffer = await QRCode.toBuffer(target, { ...opts, type: 'png', width: SIZE });
const svg = await QRCode.toString(target, { ...opts, type: 'svg', width: SIZE });

// ---- verify: decode the PNG we just produced -------------------------------
const png = PNG.sync.read(pngBuffer);
const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);

if (!decoded) {
  console.error('✗ Generated QR could not be decoded at all. Not writing files.');
  process.exit(1);
}
if (decoded.data !== target) {
  console.error('✗ Generated QR decodes to the WRONG value. Not writing files.');
  console.error(`  encoded: ${target}`);
  console.error(`  decoded: ${decoded.data}`);
  process.exit(1);
}

writeFileSync(pngPath, pngBuffer);
writeFileSync(svgPath, svg);

console.log(`✓ QR verified by decode round-trip`);
console.log(`  starter text : ${TEXT}`);
console.log(`  target URL   : ${target}`);
console.log(`  decoded as   : ${decoded.data}`);
console.log(`  modules      : ${decoded.location ? 'located' : 'n/a'} · ECC level H · ${SIZE}px`);
console.log(`  png          : ${pngPath}`);
console.log(`  svg          : ${svgPath}`);

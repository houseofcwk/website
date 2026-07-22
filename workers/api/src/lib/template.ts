// template — the {{token}} renderer shared by every editable string in the
// agent config (result blocks, tool responses, ambient context, email copy).
//
// Deliberately tiny and total: dot-path lookup, no expressions, no conditionals,
// no loops. An unknown or empty token renders as '' rather than throwing or
// leaking "{{archetype.nmae}}" into a visitor's chat — a typo in the Studio
// should degrade a sentence, never break a turn.

type Scope = Record<string, unknown>;

const TOKEN = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;

function lookup(scope: Scope, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (acc === null || acc === undefined) return undefined;
    if (typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[part];
  }, scope);
}

/** Render `{{a.b}}` tokens against `scope`. Unknown paths render as ''. */
export function render(tpl: string | null | undefined, scope: Scope): string {
  if (!tpl) return '';
  return tpl.replace(TOKEN, (_m, path: string) => {
    const v = lookup(scope, path);
    if (v === null || v === undefined) return '';
    return typeof v === 'string' ? v : String(v);
  });
}

/**
 * Render, then collapse the whitespace a blank token leaves behind: a line that
 * rendered to nothing is dropped, and a run of blank lines becomes one. Use for
 * multi-line prose blocks; use `render` for single-line strings like titles.
 */
export function renderBlock(tpl: string | null | undefined, scope: Scope): string {
  return render(tpl, scope)
    .split('\n')
    .filter((line, i, all) => line.trim() !== '' || (i > 0 && all[i - 1].trim() !== ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

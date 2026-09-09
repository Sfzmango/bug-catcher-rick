import type { Sev } from './severity';

export const DOSSIER_FIELDS = [
  'SYMPTOM',
  'REPRODUCTION',
  'ROOT CAUSE',
  'EVIDENCE CHAIN',
  'PROPOSED SEV',
  'FIX DIRECTION',
  'REGRESSION TEST',
  'BLAST RADIUS',
  'PROD MITIGATION',
  'OPEN QUESTIONS',
] as const;

export type DossierField = (typeof DOSSIER_FIELDS)[number];
export type Confidence = 'CONFIDENT' | 'HYPOTHESIS';

export interface ParsedDossier {
  fields: Partial<Record<DossierField, string>>;
  missing: DossierField[];
  sev: Sev | null;
  confidence: Confidence | null;
  live: boolean;
}

// Optional list bullet and Markdown bold around the label are tolerated so a dossier copied out of a
// rendered chat or issue body ("**SYMPTOM** — x", "- SYMPTOM — x", "**SYMPTOM:** x") still parses.
const LABEL_LINE = /^\s*(?:[-*]\s+)?\**([A-Za-z][A-Za-z ]*?)\**\s*(?:—|-|:)\**\s*(.*)$/;
// A PROD MITIGATION value whose leading token negates it ("None; not a live bug", "n/a (dev-only)",
// "none needed", "Not live.") is NOT live, regardless of any trailing explanation. A bare "No" is
// deliberately NOT in the list: "No workaround; rotate the token now." is a live mitigation, and the
// flag only ever adds a warning, so the conservative reading is live. A leading `-`/`—` is likewise
// NOT negation: a bulleted mitigation list ("- Roll back the release now") is content, and only a
// value that is nothing but dashes counts as empty.
const NOT_LIVE_LEAD = /^(?:none|n\/a|na|not)(?![a-z])/i;
const DASHES_ONLY = /^[-—–]+$/;
// A line that is nothing but a Markdown fence marker (``` or ```text).
const FENCE_LINE = /^\s*```\w*\s*$/;

function normaliseLabel(raw: string): DossierField | null {
  const key = raw.trim().replace(/\s+/g, ' ').toUpperCase();
  return (DOSSIER_FIELDS as readonly string[]).includes(key) ? (key as DossierField) : null;
}

/**
 * Removes a Markdown fence wrapper. The opening fence may sit anywhere before the first label (a
 * preamble such as "Here is the dossier:" often precedes it), and a trailing closing fence is
 * dropped regardless of whether an opening one was seen, so it never leaks into the last field.
 * Fence lines inside a value (a code block within EVIDENCE CHAIN, say) are left alone.
 */
function stripFence(text: string): string {
  const lines = text.split(/\r?\n/);
  const firstLabel = lines.findIndex((l) => {
    const m = LABEL_LINE.exec(l);
    return m !== null && normaliseLabel(m[1] ?? '') !== null;
  });
  const head = firstLabel === -1 ? lines.length : firstLabel;
  const kept = lines.filter((l, i) => i >= head || !FENCE_LINE.test(l));
  for (let i = kept.length - 1; i >= 0; i -= 1) {
    const t = kept[i]?.trim() ?? '';
    if (t === '') continue;
    if (FENCE_LINE.test(t)) kept.splice(i, 1);
    break;
  }
  return kept.join('\n');
}

const SEV_NAMES: Record<string, Sev> = { critical: 1, high: 2, moderate: 3, low: 4 };

function highest(levels: Sev[]): Sev | null {
  return levels.length ? (Math.min(...levels) as Sev) : null;
}

/**
 * Reads the SEV from a PROPOSED SEV value. "Highest wins" is deliberate (under-triage is the costlier
 * error), so "SEV2, arguably SEV1" is SEV1 — and, knowingly, "SEV3 (not SEV2)" is SEV2 as well.
 * Accepted shapes, in priority order: SEV tokens (SEV1, SEV 1, SEV-1, sev1); a bare level digit
 * (`1`); the rubric names (Critical / High / Moderate / Low). Names are only consulted when no token
 * or bare digit is present, so prose like "high-visibility page" cannot promote a tagged SEV3.
 */
export function extractSev(text: string): Sev | null {
  const tokens = [...text.matchAll(/\bSEV\s*-?\s*([1-4])\b/gi)].map((m) => Number(m[1]) as Sev);
  if (tokens.length) return highest(tokens);
  // The bare-digit shape is judged on the first line only, so a reason on the next line still parses.
  const bare = /^\s*([1-4])\s*(?:[.,;:)—-].*)?$/.exec(text.split('\n')[0] ?? '');
  if (bare) return Number(bare[1]) as Sev;
  const names = [...text.matchAll(/\b(critical|high|moderate|low)\b/gi)].map((m) => SEV_NAMES[m[1]!.toLowerCase()]!);
  return highest(names);
}

/**
 * The agent emits the tag as an upper-case token, so match case-sensitively: the English word
 * "confident" inside a HYPOTHESIS root cause must not flip it. If both tokens appear, the
 * conservative reading (HYPOTHESIS) wins.
 */
export function extractConfidence(text: string): Confidence | null {
  if (/\bHYPOTHESIS\b/.test(text)) return 'HYPOTHESIS';
  if (/\bCONFIDENT\b/.test(text)) return 'CONFIDENT';
  return null;
}

export function isLiveMitigation(value: string | undefined): boolean {
  if (value === undefined) return false;
  const firstLine = (value.split('\n')[0] ?? '').trim();
  if (firstLine === '' || DASHES_ONLY.test(firstLine)) return false;
  return !NOT_LIVE_LEAD.test(firstLine);
}

export function parseDossier(text: string): ParsedDossier {
  const fields: Partial<Record<DossierField, string>> = {};
  const buffers = new Map<DossierField, string[]>();
  let current: DossierField | null = null;

  for (const line of stripFence(text).split(/\r?\n/)) {
    const m = LABEL_LINE.exec(line);
    const label = m ? normaliseLabel(m[1] ?? '') : null;
    if (m && label) {
      current = label;
      buffers.set(label, [(m[2] ?? '').trim()]);
    } else if (current) {
      buffers.get(current)?.push(line.trim());
    }
  }

  for (const [label, lines] of buffers) {
    const value = lines.join('\n').trim();
    // A label with nothing after it is "not provided", not an empty field.
    if (value) fields[label] = value;
  }

  const missing = DOSSIER_FIELDS.filter((f) => !(f in fields));
  const sevText = fields['PROPOSED SEV'];
  const rootCause = fields['ROOT CAUSE'];

  return {
    fields,
    missing,
    sev: sevText ? extractSev(sevText) : null,
    confidence: rootCause ? extractConfidence(rootCause) : null,
    live: isLiveMitigation(fields['PROD MITIGATION']),
  };
}

import { describe, expect, it } from 'vitest';
import { exampleDossier } from '../content/exampleDossier';
import { DOSSIER_FIELDS, extractConfidence, extractSev, isLiveMitigation, parseDossier } from './dossier';

describe('parseDossier', () => {
  it('parses the example dossier completely', () => {
    const d = parseDossier(exampleDossier);
    expect(d.missing).toEqual([]);
    expect(Object.keys(d.fields)).toHaveLength(10);
    expect(d.sev).toBe(1);
    expect(d.confidence).toBe('CONFIDENT');
    expect(d.live).toBe(true);
    expect(d.fields.SYMPTOM).toMatch(/^Approval inbox returns 500/);
  });

  it('treats em-dash and colon separators identically, and tolerates no spaces', () => {
    const a = parseDossier('SYMPTOM — x');
    const b = parseDossier('SYMPTOM: x');
    expect(a).toEqual(b);
    expect(a.fields.SYMPTOM).toBe('x');
    expect(parseDossier('REGRESSION TEST—x').fields['REGRESSION TEST']).toBe('x');
    expect(parseDossier('REGRESSION TEST - x').fields['REGRESSION TEST']).toBe('x');
  });

  it('joins multi-line values with newlines and stops at the next label', () => {
    const d = parseDossier(
      ['EVIDENCE CHAIN — a.rb:1', '  b.rb:2', 'c.rb:3', 'PROPOSED SEV — SEV3'].join('\n'),
    );
    expect(d.fields['EVIDENCE CHAIN']).toBe('a.rb:1\nb.rb:2\nc.rb:3');
    expect(d.fields['PROPOSED SEV']).toBe('SEV3');
  });

  it('lists missing fields in canonical order', () => {
    const d = parseDossier('ROOT CAUSE — y\nSYMPTOM — x');
    expect(d.missing).toEqual(DOSSIER_FIELDS.filter((f) => f !== 'SYMPTOM' && f !== 'ROOT CAUSE'));
  });

  it('with no labels every field is missing and sev is null', () => {
    const d = parseDossier('just some prose\nwith no labels');
    expect(d.missing).toEqual([...DOSSIER_FIELDS]);
    expect(d.sev).toBeNull();
    expect(d.confidence).toBeNull();
    expect(d.live).toBe(false);
  });

  it('ignores lines before the first label', () => {
    const d = parseDossier('preamble\nSYMPTOM — x');
    expect(d.fields.SYMPTOM).toBe('x');
    expect(Object.keys(d.fields)).toEqual(['SYMPTOM']);
  });

  it('extracts SEV in every spelling; the higher severity wins', () => {
    expect(parseDossier('PROPOSED SEV — SEV2').sev).toBe(2);
    expect(parseDossier('PROPOSED SEV — SEV 2').sev).toBe(2);
    expect(parseDossier('PROPOSED SEV — SEV-2').sev).toBe(2);
    expect(parseDossier('PROPOSED SEV — sev2').sev).toBe(2);
    expect(parseDossier('PROPOSED SEV — SEV2, arguably SEV1').sev).toBe(1);
    expect(extractSev('nothing here')).toBeNull();
  });

  it('extracts hand-written SEV shapes: bare digit, rubric names, spaced and hyphenated tokens', () => {
    expect(parseDossier('PROPOSED SEV — 1').sev).toBe(1);
    expect(parseDossier('PROPOSED SEV — 3.').sev).toBe(3);
    expect(parseDossier('PROPOSED SEV — 2 — core workflow down').sev).toBe(2);
    expect(parseDossier('PROPOSED SEV — 2\nbecause every newly-invited member is locked out').sev).toBe(2);
    expect(extractSev('3\nthere is a workaround')).toBe(3);
    expect(parseDossier('PROPOSED SEV — Critical').sev).toBe(1);
    expect(parseDossier('PROPOSED SEV — High').sev).toBe(2);
    expect(parseDossier('PROPOSED SEV — Moderate').sev).toBe(3);
    expect(parseDossier('PROPOSED SEV — Low').sev).toBe(4);
    expect(parseDossier('PROPOSED SEV — sev 2').sev).toBe(2);
    expect(parseDossier('PROPOSED SEV — SEV-3').sev).toBe(3);
    expect(parseDossier('PROPOSED SEV — moderate, arguably high').sev).toBe(2);
  });

  it('does not let rubric names in prose promote a tagged SEV', () => {
    expect(parseDossier('PROPOSED SEV — SEV3: a high-visibility page, but there is a workaround').sev).toBe(3);
    expect(parseDossier('PROPOSED SEV — SEV3 (not SEV2: there is a workaround)').sev).toBe(2); // highest wins, deliberately
    expect(parseDossier('PROPOSED SEV — unclear, needs triage').sev).toBeNull();
    expect(parseDossier('PROPOSED SEV — 5').sev).toBeNull();
  });

  it('detects confidence tags', () => {
    expect(parseDossier('ROOT CAUSE — maybe. HYPOTHESIS').confidence).toBe('HYPOTHESIS');
    expect(parseDossier('ROOT CAUSE — no tag here').confidence).toBeNull();
    expect(extractConfidence('CONFIDENT')).toBe('CONFIDENT');
  });

  it('matches the tags case-sensitively and prefers HYPOTHESIS when both appear', () => {
    expect(
      parseDossier('ROOT CAUSE — Probably the cache. HYPOTHESIS; not confident until the log confirms.').confidence,
    ).toBe('HYPOTHESIS');
    expect(parseDossier('ROOT CAUSE — HYPOTHESIS — Confident-looking but unverified.').confidence).toBe(
      'HYPOTHESIS',
    );
    expect(extractConfidence('CONFIDENT, though a hypothesis was considered')).toBe('CONFIDENT');
    expect(extractConfidence('we are confident')).toBeNull();
    expect(extractConfidence('a hypothesis')).toBeNull();
  });

  it('computes the live flag from PROD MITIGATION', () => {
    expect(parseDossier('PROD MITIGATION — none').live).toBe(false);
    expect(parseDossier('PROD MITIGATION — n/a').live).toBe(false);
    expect(parseDossier('PROD MITIGATION — not a live bug').live).toBe(false);
    expect(parseDossier('PROD MITIGATION — Run the one-off insert in prod now.').live).toBe(true);
    expect(isLiveMitigation(undefined)).toBe(false);
  });

  it('treats a negated PROD MITIGATION with trailing prose as not live', () => {
    expect(parseDossier('PROD MITIGATION — None; not a live bug.').live).toBe(false);
    expect(parseDossier('PROD MITIGATION — n/a (dev-only)').live).toBe(false);
    expect(parseDossier('PROD MITIGATION — none needed').live).toBe(false);
    expect(parseDossier('PROD MITIGATION — None — CI-only failure.').live).toBe(false);
    expect(parseDossier('PROD MITIGATION — Not live.').live).toBe(false);
    expect(parseDossier('PROD MITIGATION — Notify on-call and roll back the release.').live).toBe(true);
    expect(parseDossier('PROD MITIGATION — Nothing yet; rotate the leaked token first.').live).toBe(true);
    expect(parseDossier('PROD MITIGATION — No workaround; rotate the leaked token now.').live).toBe(true);
    expect(parseDossier('PROD MITIGATION — None; not a live bug.').live).toBe(false);
  });

  it('treats a bulleted PROD MITIGATION list as live; only an empty or dash-only value is not', () => {
    const bulleted = ['PROPOSED SEV — SEV1', 'PROD MITIGATION —', '- Roll back the release now', '- Rotate the leaked token'].join('\n');
    expect(parseDossier(bulleted).live).toBe(true);
    expect(parseDossier('PROD MITIGATION — — Roll back the release now').live).toBe(true);
    expect(parseDossier('PROD MITIGATION — None; not a live bug.').live).toBe(false);
    expect(parseDossier('PROD MITIGATION — -').live).toBe(false);
    expect(parseDossier('PROD MITIGATION — —').live).toBe(false);
    expect(parseDossier('PROD MITIGATION —').live).toBe(false);
    expect(isLiveMitigation('')).toBe(false);
    expect(isLiveMitigation('-')).toBe(false);
  });

  it('strips a fenced code block wrapper', () => {
    const fenced = '```\n' + exampleDossier + '\n```';
    expect(parseDossier(fenced)).toEqual(parseDossier(exampleDossier));
    const fencedLang = '```text\nSYMPTOM — x\n```\n';
    expect(parseDossier(fencedLang).fields.SYMPTOM).toBe('x');
  });

  it('strips a fence that follows a preamble line, so the closing fence never leaks into the last field', () => {
    const withPreamble = 'Here is the dossier:\n\n```\n' + exampleDossier + '\n```\n';
    expect(parseDossier(withPreamble)).toEqual(parseDossier(exampleDossier));
    const short = 'Here is the dossier:\n```text\nSYMPTOM — x\nOPEN QUESTIONS — none\n```';
    expect(parseDossier(short).fields['OPEN QUESTIONS']).toBe('none');
    // A stray closing fence with no opening one is dropped too.
    expect(parseDossier('OPEN QUESTIONS — none\n```').fields['OPEN QUESTIONS']).toBe('none');
    // A fence inside a value is content and stays.
    expect(parseDossier('EVIDENCE CHAIN —\n```\nlog line\n```\nOPEN QUESTIONS — none').fields['EVIDENCE CHAIN']).toBe('```\nlog line\n```');
  });

  it('matches labels case-insensitively and with collapsed whitespace', () => {
    expect(parseDossier('Symptom — x').fields.SYMPTOM).toBe('x');
    expect(parseDossier('root   cause: y').fields['ROOT CAUSE']).toBe('y');
  });

  it('treats a present-but-empty field as missing', () => {
    const d = parseDossier('SYMPTOM —\nROOT CAUSE — y');
    expect(d.missing).toContain('SYMPTOM');
    expect(d.fields.SYMPTOM).toBeUndefined();
    expect(d.fields['ROOT CAUSE']).toBe('y');
    expect(parseDossier('SYMPTOM —\n\n   \nPROPOSED SEV — SEV4').missing).toContain('SYMPTOM');
  });

  it('accepts Markdown-bold and bulleted label shapes', () => {
    expect(parseDossier('**SYMPTOM** — x').fields.SYMPTOM).toBe('x');
    expect(parseDossier('**SYMPTOM:** x').fields.SYMPTOM).toBe('x');
    expect(parseDossier('- SYMPTOM — x').fields.SYMPTOM).toBe('x');
    expect(parseDossier('* ROOT CAUSE: y\n- PROPOSED SEV — SEV2').fields).toEqual({ 'ROOT CAUSE': 'y', 'PROPOSED SEV': 'SEV2' });
    expect(parseDossier('SYMPTOM — a bulleted value\n- first\n- second').fields.SYMPTOM).toBe(
      'a bulleted value\n- first\n- second',
    );
  });

  it('does not treat unknown "Label: value" lines as new fields', () => {
    const d = parseDossier('SYMPTOM — x\nNote: still the symptom');
    expect(d.fields.SYMPTOM).toBe('x\nNote: still the symptom');
  });
});

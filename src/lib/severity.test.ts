import { describe, expect, it } from 'vitest';
import { routeFor, sevMeta, type Sev } from './severity';

describe('routeFor', () => {
  it('SEV1 not live -> /orchestrator, chore never allowed, no mitigation-first', () => {
    const d = routeFor({ sev: 1 });
    expect(d.route).toBe('/orchestrator');
    expect(d.choreAllowed).toBe(false);
    expect(d.mitigationFirst).toBe(false);
  });

  it('SEV1 live -> /orchestrator with mitigation first', () => {
    const d = routeFor({ sev: 1, live: true });
    expect(d.route).toBe('/orchestrator');
    expect(d.mitigationFirst).toBe(true);
    expect(d.reason).toMatch(/mitigation FIRST/);
  });

  it('SEV2 with both qualifiers true -> still /orchestrator, chore not allowed', () => {
    const d = routeFor({ sev: 2, oneFile: true, noMigrationOrSecurity: true });
    expect(d.route).toBe('/orchestrator');
    expect(d.choreAllowed).toBe(false);
    expect(d.mitigationFirst).toBe(false);
  });

  it('SEV3 default -> /orchestrator', () => {
    expect(routeFor({ sev: 3 }).route).toBe('/orchestrator');
  });

  it('SEV3 with only one qualifier -> /orchestrator; with both -> /chore', () => {
    expect(routeFor({ sev: 3, oneFile: true }).route).toBe('/orchestrator');
    expect(routeFor({ sev: 3, noMigrationOrSecurity: true }).route).toBe('/orchestrator');
    const both = routeFor({ sev: 3, oneFile: true, noMigrationOrSecurity: true });
    expect(both.route).toBe('/chore');
    expect(both.choreAllowed).toBe(true);
  });

  it('SEV4 -> /chore', () => {
    const d = routeFor({ sev: 4 });
    expect(d.route).toBe('/chore');
    expect(d.choreAllowed).toBe(true);
  });

  it('carries the sev and a display label on the decision', () => {
    expect(routeFor({ sev: 1 })).toMatchObject({ sev: 1, label: '/orchestrator' });
    expect(routeFor({ sev: 2 })).toMatchObject({ sev: 2, label: '/orchestrator' });
    expect(routeFor({ sev: 3 })).toMatchObject({ sev: 3, label: '/orchestrator' });
    expect(routeFor({ sev: 3, oneFile: true, noMigrationOrSecurity: true }).label).toBe('/chore permitted');
    expect(routeFor({ sev: 4 })).toMatchObject({ sev: 4, label: '/chore' });
  });

  it('SEV3 live does not trigger mitigation-first', () => {
    expect(routeFor({ sev: 3, live: true }).mitigationFirst).toBe(false);
  });
});

describe('sevMeta', () => {
  it('returns the four names and distinct badge strings', () => {
    const sevs: Sev[] = [1, 2, 3, 4];
    const metas = sevs.map(sevMeta);
    expect(metas.map((m) => m.name)).toEqual(['Critical', 'High', 'Moderate', 'Low']);
    expect(new Set(metas.map((m) => m.badge)).size).toBe(4);
    expect(metas.map((m) => m.cssVar)).toEqual(['--sev-1', '--sev-2', '--sev-3', '--sev-4']);
  });
});

export type Sev = 1 | 2 | 3 | 4;

export interface RouteInput {
  sev: Sev;
  live?: boolean;
  oneFile?: boolean;
  noMigrationOrSecurity?: boolean;
}

export interface RouteDecision {
  sev: Sev;
  route: '/orchestrator' | '/chore';
  /** Display label for the route: SEV3 with both qualifiers reads "/chore permitted". */
  label: '/orchestrator' | '/chore' | '/chore permitted';
  choreAllowed: boolean;
  mitigationFirst: boolean;
  reason: string;
}

export interface SevMeta {
  name: 'Critical' | 'High' | 'Moderate' | 'Low';
  badge: string;
  cssVar: string;
}

const META: Record<Sev, SevMeta> = {
  1: { name: 'Critical', badge: 'SEV1', cssVar: '--sev-1' },
  2: { name: 'High', badge: 'SEV2', cssVar: '--sev-2' },
  3: { name: 'Moderate', badge: 'SEV3', cssVar: '--sev-3' },
  4: { name: 'Low', badge: 'SEV4', cssVar: '--sev-4' },
};

export function sevMeta(sev: Sev): SevMeta {
  return META[sev];
}

/**
 * Encodes the /bug-catcher severity rubric exactly:
 * SEV1/SEV2 -> /orchestrator, never /chore (SEV1 live -> mitigation first);
 * SEV3 -> /orchestrator unless genuinely one file with no migration/security surface;
 * SEV4 -> /chore.
 */
export function routeFor(input: RouteInput): RouteDecision {
  const { sev, live = false, oneFile = false, noMigrationOrSecurity = false } = input;
  switch (sev) {
    case 1:
      return {
        sev,
        route: '/orchestrator',
        label: '/orchestrator',
        choreAllowed: false,
        mitigationFirst: live,
        reason: live
          ? 'SEV1 and live: apply the mitigation FIRST (gated), then /orchestrator. Never /chore.'
          : 'SEV1 always routes to /orchestrator. Never /chore, however small the diff looks.',
      };
    case 2:
      return {
        sev,
        route: '/orchestrator',
        label: '/orchestrator',
        choreAllowed: false,
        mitigationFirst: false,
        reason: 'SEV2 always routes to /orchestrator. Never /chore, however small the diff looks.',
      };
    case 3: {
      const chore = oneFile && noMigrationOrSecurity;
      return {
        sev,
        route: chore ? '/chore' : '/orchestrator',
        label: chore ? '/chore permitted' : '/orchestrator',
        choreAllowed: chore,
        mitigationFirst: false,
        reason: chore
          ? 'SEV3: /chore permitted because the fix is genuinely one file with no migration or security surface.'
          : 'SEV3 routes to /orchestrator; /chore only if genuinely one file with no migration or security surface.',
      };
    }
    case 4:
      return {
        sev,
        route: '/chore',
        label: '/chore',
        choreAllowed: true,
        mitigationFirst: false,
        reason: 'SEV4 is cosmetic or low-impact polish: /chore.',
      };
  }
}

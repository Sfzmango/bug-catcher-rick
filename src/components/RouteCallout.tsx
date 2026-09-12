import type { RouteDecision } from '../lib/severity';
import styles from './RouteCallout.module.css';

interface Props {
  decision: RouteDecision | null;
  /** Raw PROPOSED SEV text when the field is present; lets the callout say "unreadable" rather than "missing". */
  sevText?: string;
}

export function RouteCallout({ decision, sevText }: Props) {
  if (!decision) {
    const unreadable = sevText !== undefined && sevText.trim() !== '';
    return (
      <div className={styles.callout} data-testid="route-callout" aria-live="polite" data-sev-state={unreadable ? 'unreadable' : 'missing'}>
        <span className={styles.label}>ROUTE ▶</span>
        <span className={styles.route}>{unreadable ? 'PROPOSED SEV could not be read' : 'PROPOSED SEV missing'}</span>
        {unreadable ? (
          <p className={styles.reason}>
            The value <code className={styles.raw}>{sevText.trim()}</code> has no SEV1–SEV4 token, level digit, or
            Critical / High / Moderate / Low name, so no route can be given.
          </p>
        ) : (
          <p className={styles.reason}>Add a PROPOSED SEV line (SEV1–SEV4) to get a route.</p>
        )}
      </div>
    );
  }
  return (
    <div className={styles.callout} data-testid="route-callout" data-route={decision.route} aria-live="polite">
      <span className={styles.label}>ROUTE ▶</span>
      <span className={styles.route}>{decision.label}</span>
      {decision.sev <= 2 && <span className={styles.never}>never /chore</span>}
      {decision.mitigationFirst && (
        <p className={styles.warn}>SEV1 is live: apply the mitigation FIRST (gated).</p>
      )}
      <p className={styles.reason}>{decision.reason}</p>
    </div>
  );
}

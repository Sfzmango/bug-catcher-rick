import type { ReactNode } from 'react';
import { DOSSIER_FIELDS, type ParsedDossier } from '../lib/dossier';
import type { RouteDecision } from '../lib/severity';
import { RickSprite } from './RickSprite';
import { RouteCallout } from './RouteCallout';
import { SevBadge } from './SevBadge';
import styles from './DossierCard.module.css';

interface Props {
  dossier: ParsedDossier;
  decision: RouteDecision | null;
  qualifiers?: ReactNode;
}

export function DossierCard({ dossier, decision, qualifiers }: Props) {
  const headline = dossier.fields.SYMPTOM?.split('\n')[0] ?? 'Untitled dossier';
  return (
    <article className={styles.card} aria-label="Dossier card">
      <header className={styles.header}>
        <RickSprite size={72} idle={false} />
        <div className={styles.headText}>
          <h2 className={styles.headline}>{headline}</h2>
          <div className={styles.chips}>
            <SevBadge sev={dossier.sev} />
            {dossier.confidence && (
              <span className={styles.chip} data-testid="confidence-chip">
                {dossier.confidence}
              </span>
            )}
            {dossier.live && (
              <span className={`${styles.chip} ${styles.live}`} data-testid="live-chip">
                LIVE
              </span>
            )}
          </div>
        </div>
      </header>
      {qualifiers}
      <RouteCallout decision={decision} sevText={dossier.fields['PROPOSED SEV']} />
      <dl className={styles.fields}>
        {DOSSIER_FIELDS.map((field) => (
          <div key={field} className={styles.row}>
            <dt className={styles.dt}>{field}</dt>
            <dd className={styles.dd}>
              {dossier.fields[field] ?? <span className={styles.missing}>— not provided —</span>}
            </dd>
          </div>
        ))}
      </dl>
      {dossier.missing.length > 0 && (
        <p className={styles.missingList} data-testid="missing-list">
          <span className="pixel">MISSING:</span> {dossier.missing.join(', ')}
        </p>
      )}
    </article>
  );
}

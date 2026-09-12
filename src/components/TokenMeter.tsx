import type { TokenBudget } from '../content/types';
import styles from './TokenMeter.module.css';

interface Props {
  budget: TokenBudget;
}

export function TokenMeter({ budget }: Props) {
  const capLabel = `${Math.round(budget.cap / 1000)}k`;
  const checkpointPct = budget.checkpoint * 100;
  const haltPct = budget.halt * 100;
  return (
    <div className={styles.wrap}>
      <div
        className={styles.track}
        role="meter"
        aria-label="Token budget"
        aria-valuemin={0}
        aria-valuemax={budget.cap}
        aria-valuenow={budget.cap}
        aria-valuetext={`${capLabel} soft cap; checkpoint at ${checkpointPct}%, halt at ${haltPct}%`}
      >
        <div className={styles.segment} style={{ width: `${checkpointPct}%` }} />
        <div className={`${styles.segment} ${styles.warn}`} style={{ width: `${haltPct - checkpointPct}%` }} />
        <div className={`${styles.segment} ${styles.stop}`} style={{ width: `${100 - haltPct}%` }} />
        <span className={styles.tick} style={{ left: `${checkpointPct}%` }} aria-hidden="true" />
        <span className={styles.tick} style={{ left: `${haltPct}%` }} aria-hidden="true" />
      </div>
      <div className={styles.labels}>
        <span style={{ left: `${checkpointPct}%` }}>
          {checkpointPct}%<br />
          checkpoint
        </span>
        <span style={{ left: `${haltPct}%` }}>
          {haltPct}%<br />
          halt
        </span>
        <span className={styles.cap}>{capLabel}</span>
      </div>
    </div>
  );
}

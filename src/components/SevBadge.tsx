import type { Sev } from '../lib/severity';
import { sevMeta } from '../lib/severity';
import styles from './SevBadge.module.css';

interface Props {
  sev: Sev | null;
  size?: number;
}

export function SevBadge({ sev, size = 56 }: Props) {
  const token = sev ? sevMeta(sev).cssVar : '--sev-unknown';
  const colours = { fill: `var(${token})`, ring: `var(${token}-deep)` };
  const text = sev ? String(sev) : '?';
  const label = sev ? `${sevMeta(sev).badge} ${sevMeta(sev).name}` : 'SEV unknown';
  return (
    <span className={styles.badge} data-sev={sev ?? 'unknown'} data-testid="sev-badge">
      <svg width={size} height={size} viewBox="0 0 56 56" role="img" aria-label={label}>
        <polygon
          points="28,2 50,15 50,41 28,54 6,41 6,15"
          fill={colours.fill}
          stroke={colours.ring}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <polygon points="28,10 43,19 43,37 28,46 13,37 13,19" fill="none" stroke="#f6f1df" strokeWidth="2" />
        <text x="28" y="34" textAnchor="middle" fontFamily="'Press Start 2P', monospace" fontSize="16" fill="#f6f1df">
          {text}
        </text>
      </svg>
      <span className={styles.caption}>{sev ? sevMeta(sev).badge : 'SEV ?'}</span>
    </span>
  );
}

import type { Move } from '../content/types';
import styles from './MoveList.module.css';

interface Props {
  moves: Move[];
}

export function MoveList({ moves }: Props) {
  return (
    <ol className={styles.list}>
      {moves.map((m, i) => (
        <li key={m.field} className={styles.move}>
          <div className={styles.head}>
            <span className={styles.index}>{String(i + 1).padStart(2, '0')}</span>
            <span className={styles.field}>{m.field}</span>
            {m.tag && <span className={styles.tag}>{m.tag}</span>}
            <span className={styles.pp} aria-hidden="true">
              ●●●
            </span>
          </div>
          <p className={styles.desc}>{m.description}</p>
        </li>
      ))}
    </ol>
  );
}

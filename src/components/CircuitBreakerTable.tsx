import type { CircuitBreaker } from '../content/types';
import styles from './CircuitBreakerTable.module.css';

interface Props {
  rows: CircuitBreaker[];
}

export function CircuitBreakerTable({ rows }: Props) {
  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <caption className={styles.caption}>Circuit-breakers</caption>
        <thead>
          <tr>
            <th scope="col">Failure</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.failure}>
              <td>{r.failure}</td>
              <td>{r.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

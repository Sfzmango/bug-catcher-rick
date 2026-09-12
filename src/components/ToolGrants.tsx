import type { ToolGrant } from '../content/types';
import styles from './ToolGrants.module.css';

interface Props {
  grants: ToolGrant[];
}

export function ToolGrants({ grants }: Props) {
  return (
    <ul className={styles.list}>
      {grants.map((g) => (
        <li key={g.name} className={styles.item} data-granted={g.granted}>
          <span className={styles.mark} aria-hidden="true">
            {g.granted ? '[x]' : '[ ]'}
          </span>
          {g.granted ? (
            <code>{g.name}</code>
          ) : (
            <>
              <s>
                <code>{g.name}</code>
              </s>
              <span className="visually-hidden"> denied</span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

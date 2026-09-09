import type { ReactNode } from 'react';
import styles from './DialogueBox.module.css';

interface Props {
  children: ReactNode;
  arrow?: boolean;
  className?: string;
}

export function DialogueBox({ children, arrow = false, className = '' }: Props) {
  return (
    <div className={`${styles.box} ${className}`}>
      <div className={styles.inner}>{children}</div>
      {arrow && (
        <span className={styles.arrow} aria-hidden="true">
          ▼
        </span>
      )}
    </div>
  );
}

import type { ReactNode } from 'react';
import styles from './Screen.module.css';

interface Props {
  children: ReactNode;
  className?: string;
}

export function Screen({ children, className = '' }: Props) {
  return (
    <div className={styles.bezel}>
      <div className={`${styles.screen} ${className}`}>
        <div className={styles.scanlines} aria-hidden="true" />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}

import { NavLink, Outlet } from 'react-router-dom';
import { toolbeltUrl, trainerCard } from '../content/rick';
import styles from './PokedexShell.module.css';

const tabs = [
  { to: '/', label: 'Dex', end: true },
  { to: '/dossier', label: 'Dossier', end: false },
];

export function PokedexShell() {
  return (
    <div className={styles.shell}>
      <header className={`${styles.header} on-shell`}>
        <div className={styles.leds} aria-hidden="true">
          <span className={styles.lens} />
          <span className={`${styles.led} ${styles.ledRed}`} />
          <span className={`${styles.led} ${styles.ledYellow}`} />
          <span className={`${styles.led} ${styles.ledGreen}`} />
        </div>
        <p className={styles.title}>
          <span>{trainerCard.name.toUpperCase()}</span>
          <span className={styles.number}>{trainerCard.number}</span>
        </p>
      </header>
      <nav className={`${styles.tabs} on-shell`} aria-label="Views">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <main className={styles.screenSlot}>
        <Outlet />
      </main>
      <footer className={`${styles.footer} on-shell`}>
        <a href={toolbeltUrl}>Maung's Agentic Toolbelt</a>
        <span aria-hidden="true"> · </span>
        <a href="https://github.com/Sfzmango/bug-catcher-rick">source</a>
      </footer>
    </div>
  );
}

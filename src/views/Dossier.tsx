import { useMemo, useState } from 'react';
import { DialogueBox } from '../components/DialogueBox';
import { DossierCard } from '../components/DossierCard';
import { Screen } from '../components/Screen';
import { exampleDossier } from '../content/exampleDossier';
import { DOSSIER_FIELDS, parseDossier } from '../lib/dossier';
import { routeFor } from '../lib/severity';
import styles from './Dossier.module.css';

export function Dossier() {
  const [text, setText] = useState('');
  const [oneFile, setOneFile] = useState(false);
  const [noMigrationOrSecurity, setNoMigrationOrSecurity] = useState(false);

  // Qualifiers are user-supplied per dossier: any change to the text resets them to unchecked.
  const updateText = (next: string) => {
    setText(next);
    setOneFile(false);
    setNoMigrationOrSecurity(false);
  };

  const parsed = useMemo(() => parseDossier(text), [text]);
  const hasAnyField = parsed.missing.length < DOSSIER_FIELDS.length;
  const hasText = text.trim() !== '';
  const decision = parsed.sev
    ? routeFor({ sev: parsed.sev, live: parsed.live, oneFile, noMigrationOrSecurity })
    : null;

  return (
    <div className={styles.view}>
      <h1 className="visually-hidden">Dossier</h1>
      <DialogueBox>
        <label htmlFor="dossier-input" className={styles.label}>
          Paste a dossier (LABEL — value or LABEL: value per field)
        </label>
        <textarea
          id="dossier-input"
          className={styles.textarea}
          rows={12}
          value={text}
          onChange={(e) => updateText(e.target.value)}
          spellCheck={false}
        />
        <div className={styles.buttons}>
          <button type="button" className={styles.button} onClick={() => updateText(exampleDossier)}>
            Load example
          </button>
          <button type="button" className={`${styles.button} ${styles.ghost}`} onClick={() => updateText('')}>
            Clear
          </button>
        </div>
      </DialogueBox>

      {hasAnyField ? (
        <Screen>
          <DossierCard
            dossier={parsed}
            decision={decision}
            qualifiers={
              parsed.sev === 3 ? (
                <fieldset className={styles.qualifiers} data-testid="sev3-qualifiers">
                  <legend className={styles.legend}>SEV3 qualifiers (both required for /chore)</legend>
                  <label className={styles.check}>
                    <input type="checkbox" checked={oneFile} onChange={(e) => setOneFile(e.target.checked)} />
                    Fix is genuinely one file
                  </label>
                  <label className={styles.check}>
                    <input
                      type="checkbox"
                      checked={noMigrationOrSecurity}
                      onChange={(e) => setNoMigrationOrSecurity(e.target.checked)}
                    />
                    No migration or security surface
                  </label>
                </fieldset>
              ) : null
            }
          />
        </Screen>
      ) : (
        <Screen>
          <div className={styles.empty} data-testid="empty-state">
            <p>Paste a dossier or load the example.</p>
            {hasText && (
              <p className={styles.hint} data-testid="parse-hint">
                No fields recognised. Each field starts on its own line as <code>LABEL — value</code> (or{' '}
                <code>LABEL: value</code>), e.g. <code>SYMPTOM — approval inbox 500s</code>.
              </p>
            )}
          </div>
        </Screen>
      )}
    </div>
  );
}

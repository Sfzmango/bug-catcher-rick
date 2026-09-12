import { CircuitBreakerTable } from '../components/CircuitBreakerTable';
import { DialogueBox } from '../components/DialogueBox';
import { MoveList } from '../components/MoveList';
import { RickSprite } from '../components/RickSprite';
import { Screen } from '../components/Screen';
import { TokenMeter } from '../components/TokenMeter';
import { ToolGrants } from '../components/ToolGrants';
import {
  autoDetectSteps,
  cardinalRules,
  circuitBreakers,
  moves,
  sevRubric,
  tokenBudget,
  toolGrants,
  trainerCard,
} from '../content/rick';
import styles from './DexEntry.module.css';

export function DexEntry() {
  return (
    <>
      <Screen>
        <div className={styles.card}>
          <div className={styles.spriteBox}>
            <RickSprite size={96} />
          </div>
          <div className={styles.cardText}>
            <h1>{trainerCard.name.toUpperCase()}</h1>
            <p className={styles.meta}>
              <span>class: {trainerCard.trainerClass}</span>
              <span>Type: {trainerCard.type}</span>
              <span className={styles.badge}>{trainerCard.badge}</span>
            </p>
            <p className={styles.description}>{trainerCard.description}</p>
          </div>
        </div>

        <div className={styles.twoCol}>
          <section aria-labelledby="tool-grants" className={styles.block}>
            <h2 id="tool-grants">Tool grants</h2>
            <ToolGrants grants={toolGrants} />
          </section>
          <section aria-labelledby="auto-detect" className={styles.block}>
            <h2 id="auto-detect">Auto-detect</h2>
            <ol className={styles.steps}>
              {autoDetectSteps.map((s) => (
                <li key={s.title}>
                  <strong>{s.title}</strong> — {s.detail}
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section aria-labelledby="moveset" className={styles.block}>
          <h2 id="moveset">Moveset (dossier fields)</h2>
          <MoveList moves={moves} />
        </section>

        <section aria-labelledby="token-budget" className={styles.block}>
          <h2 id="token-budget">Token budget</h2>
          <TokenMeter budget={tokenBudget} />
        </section>
      </Screen>

      <DialogueBox>
        <section aria-labelledby="cardinal-rules" className={styles.block}>
          <h2 id="cardinal-rules">Cardinal rules</h2>
          <ol className={styles.rules}>
            {cardinalRules.map((r) => (
              <li key={r.title}>
                <strong>{r.title}</strong> {r.detail}
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="circuit-breakers" className={styles.block}>
          <h2 id="circuit-breakers" className="visually-hidden">
            Circuit-breakers
          </h2>
          <CircuitBreakerTable rows={circuitBreakers} />
        </section>

        <section aria-labelledby="sev-rubric" className={styles.block}>
          <h2 id="sev-rubric">Severity rubric</h2>
          <ol className={styles.rules}>
            {sevRubric.map((r) => (
              <li key={r.sev}>
                <strong>
                  SEV{r.sev} — {r.name}.
                </strong>{' '}
                {r.meaning} <em>Route: {r.route}</em>
              </li>
            ))}
          </ol>
        </section>
      </DialogueBox>
    </>
  );
}

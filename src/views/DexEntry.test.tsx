import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { DexEntry } from './DexEntry';

// Pins acceptance criterion 3: the countable content the Dex entry must show.
describe('DexEntry view', () => {
  it('shows the trainer card and the read-only badge', () => {
    render(<DexEntry />, { wrapper: MemoryRouter });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('BUG CATCHER RICK');
    expect(screen.getByText('READ-ONLY')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Bug Catcher Rick sprite' })).toBeInTheDocument();
  });

  it('lists six granted tools and three denied tools with a non-colour denial cue', () => {
    render(<DexEntry />, { wrapper: MemoryRouter });
    const list = screen.getByRole('heading', { name: 'Tool grants' }).parentElement!;
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(9);
    const denied = items.filter((li) => li.querySelector('s'));
    expect(denied).toHaveLength(3);
    expect(within(list).getAllByText('denied')).toHaveLength(3);
    expect(denied.map((li) => li.textContent)).toEqual(
      expect.arrayContaining([expect.stringContaining('Edit'), expect.stringContaining('Write'), expect.stringContaining('git push')]),
    );
  });

  it('lists three auto-detect steps', () => {
    render(<DexEntry />, { wrapper: MemoryRouter });
    const section = screen.getByRole('heading', { name: 'Auto-detect' }).parentElement!;
    expect(within(section).getAllByRole('listitem')).toHaveLength(3);
  });

  it('lists the ten dossier fields in order with the tag on ROOT CAUSE', () => {
    render(<DexEntry />, { wrapper: MemoryRouter });
    const section = screen.getByRole('heading', { name: /moveset/i }).parentElement!;
    const moves = within(section).getAllByRole('listitem');
    expect(moves.map((li) => li.textContent)).toHaveLength(10);
    const names = ['SYMPTOM', 'REPRODUCTION', 'ROOT CAUSE', 'EVIDENCE CHAIN', 'PROPOSED SEV', 'FIX DIRECTION', 'REGRESSION TEST', 'BLAST RADIUS', 'PROD MITIGATION', 'OPEN QUESTIONS'];
    names.forEach((name, i) => expect(moves[i]).toHaveTextContent(name));
    expect(moves[2]).toHaveTextContent('CONFIDENT | HYPOTHESIS');
  });

  it('lists six cardinal rules and seven circuit-breaker rows', () => {
    render(<DexEntry />, { wrapper: MemoryRouter });
    const rules = screen.getByRole('heading', { name: 'Cardinal rules' }).parentElement!;
    expect(within(rules).getAllByRole('listitem')).toHaveLength(6);
    const table = screen.getByRole('table', { name: /circuit-breakers/i });
    expect(within(table).getAllByRole('row')).toHaveLength(8); // header + 7
  });

  it('shows the 100k token meter with 60% checkpoint and 80% halt marks', () => {
    render(<DexEntry />, { wrapper: MemoryRouter });
    const meter = screen.getByRole('meter', { name: 'Token budget' });
    expect(meter).toHaveAttribute('aria-valuemax', '100000');
    expect(meter).toHaveAttribute('aria-valuetext', expect.stringMatching(/checkpoint at 60%.*halt at 80%/));
    expect(screen.getByText(/checkpoint/)).toHaveTextContent('60%');
    expect(screen.getByText(/halt/)).toHaveTextContent('80%');
  });
});

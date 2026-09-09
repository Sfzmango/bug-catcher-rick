import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Dossier } from './Dossier';

const sev3 = ['SYMPTOM — modal will not dismiss on the settings page', 'PROPOSED SEV — SEV3'].join('\n');

describe('Dossier view', () => {
  it('empty textarea shows the empty-state prompt and no card', () => {
    render(<Dossier />);
    expect(screen.getByTestId('empty-state')).toHaveTextContent(/paste a dossier or load the example/i);
    expect(screen.queryByRole('article', { name: /dossier card/i })).not.toBeInTheDocument();
  });

  it('Load example fills the textarea and renders a SEV1 live card with mitigation-first', async () => {
    const user = userEvent.setup();
    render(<Dossier />);
    await user.click(screen.getByRole('button', { name: /load example/i }));
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toContain('SYMPTOM');
    expect(screen.getByTestId('sev-badge')).toHaveAttribute('data-sev', '1');
    expect(screen.getByTestId('confidence-chip')).toHaveTextContent('CONFIDENT');
    expect(screen.getByTestId('live-chip')).toBeInTheDocument();
    expect(screen.getByTestId('route-callout')).toHaveTextContent(/mitigation FIRST/);
    expect(screen.getByTestId('route-callout')).toHaveTextContent('/orchestrator');
    expect(screen.getByTestId('route-callout')).toHaveTextContent(/never \/chore/);
    expect(screen.queryByTestId('missing-list')).not.toBeInTheDocument();
  });

  it('a SEV3 dossier shows the qualifier checkboxes; checking both switches to /chore permitted', async () => {
    const user = userEvent.setup();
    render(<Dossier />);
    await user.click(screen.getByRole('textbox'));
    await user.paste(sev3);
    expect(screen.getByTestId('sev3-qualifiers')).toBeInTheDocument();
    expect(screen.getByTestId('route-callout')).toHaveTextContent('/orchestrator');
    expect(screen.getByTestId('route-callout')).not.toHaveTextContent(/never \/chore/);
    await user.click(screen.getByRole('checkbox', { name: /one file/i }));
    expect(screen.getByTestId('route-callout')).toHaveTextContent('/orchestrator');
    expect(screen.getByTestId('route-callout')).not.toHaveTextContent(/never \/chore/);
    await user.click(screen.getByRole('checkbox', { name: /no migration or security/i }));
    expect(screen.getByTestId('route-callout')).toHaveTextContent('/chore permitted');
    expect(screen.getByTestId('route-callout')).not.toHaveTextContent(/never \/chore/);
    expect(screen.getByTestId('missing-list')).toHaveTextContent(/REPRODUCTION/);
  });

  it('resets the SEV3 qualifiers whenever the dossier text changes', async () => {
    const user = userEvent.setup();
    render(<Dossier />);
    await user.click(screen.getByRole('textbox'));
    await user.paste(sev3);
    await user.click(screen.getByRole('checkbox', { name: /one file/i }));
    await user.click(screen.getByRole('checkbox', { name: /no migration or security/i }));
    expect(screen.getByTestId('route-callout')).toHaveTextContent('/chore permitted');

    await user.clear(screen.getByRole('textbox'));
    await user.paste('SYMPTOM — a different SEV3 bug\nPROPOSED SEV — SEV3');
    expect(screen.getByRole('checkbox', { name: /one file/i })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /no migration or security/i })).not.toBeChecked();
    expect(screen.getByTestId('route-callout')).toHaveTextContent('/orchestrator');
    expect(screen.getByTestId('route-callout')).not.toHaveTextContent('/chore permitted');
  });

  it('a dossier without PROPOSED SEV renders the badge as ? and a missing-SEV callout', async () => {
    const user = userEvent.setup();
    render(<Dossier />);
    await user.click(screen.getByRole('textbox'));
    await user.paste('SYMPTOM: something');
    expect(screen.getByTestId('sev-badge')).toHaveAttribute('data-sev', 'unknown');
    expect(screen.getByTestId('route-callout')).toHaveTextContent(/PROPOSED SEV missing/);
    expect(screen.getByTestId('route-callout')).toHaveAttribute('data-sev-state', 'missing');
  });

  it('a PROPOSED SEV that is present but unreadable says so and shows the raw value', async () => {
    const user = userEvent.setup();
    render(<Dossier />);
    await user.click(screen.getByRole('textbox'));
    await user.paste('SYMPTOM: something\nPROPOSED SEV — unclear, needs triage');
    expect(screen.getByTestId('sev-badge')).toHaveAttribute('data-sev', 'unknown');
    const callout = screen.getByTestId('route-callout');
    expect(callout).toHaveAttribute('data-sev-state', 'unreadable');
    expect(callout).toHaveTextContent(/could not be read/);
    expect(callout).toHaveTextContent('unclear, needs triage');
    expect(callout).not.toHaveTextContent(/missing/);
  });

  it('a hand-written PROPOSED SEV name routes correctly', async () => {
    const user = userEvent.setup();
    render(<Dossier />);
    await user.click(screen.getByRole('textbox'));
    await user.paste('SYMPTOM: label typo\nPROPOSED SEV — Low');
    expect(screen.getByTestId('sev-badge')).toHaveAttribute('data-sev', '4');
    expect(screen.getByTestId('route-callout')).toHaveTextContent('/chore');
  });

  it('shows a parse hint when text is present but no field is recognised', async () => {
    const user = userEvent.setup();
    render(<Dossier />);
    expect(screen.queryByTestId('parse-hint')).not.toBeInTheDocument();
    await user.click(screen.getByRole('textbox'));
    await user.paste('just some prose with no labels');
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByTestId('parse-hint')).toHaveTextContent(/LABEL — value/);
    expect(screen.queryByRole('article', { name: /dossier card/i })).not.toBeInTheDocument();
  });

  it('announces route changes via a polite live region', async () => {
    const user = userEvent.setup();
    render(<Dossier />);
    await user.click(screen.getByRole('button', { name: /load example/i }));
    expect(screen.getByTestId('route-callout')).toHaveAttribute('aria-live', 'polite');
  });

  it('Clear returns to the empty state', async () => {
    const user = userEvent.setup();
    render(<Dossier />);
    await user.click(screen.getByRole('button', { name: /load example/i }));
    await user.click(screen.getByRole('button', { name: /clear/i }));
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });
});

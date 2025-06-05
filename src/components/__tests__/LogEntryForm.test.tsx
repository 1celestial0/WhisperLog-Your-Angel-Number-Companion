/** @jest-environment jsdom */
import {jest} from '@jest/globals';
import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const interpretAngelNumber = jest.fn();
jest.unstable_mockModule('@/ai/flows/interpret-angel-number', () => ({interpretAngelNumber}));
jest.unstable_mockModule('@/ai/flows/generate-spoken-insight', () => ({generateSpokenInsight: jest.fn()}));
jest.unstable_mockModule('@/ai/flows/polish-note-flow', () => ({polishNote: jest.fn()}));

const toast = jest.fn();
jest.unstable_mockModule('@/hooks/use-toast', () => ({useToast: () => ({toast})}));

let LogEntryForm;

const interpretation = {
  theMessage: 'msg',
  spiritualSignificance: 'sig',
  ancientWisdom: 'anc',
  context: 'ctx',
  quote: 'quote',
  metaphor: 'met',
  reflectionQuestion: 'ref',
};

describe('LogEntryForm', () => {
  beforeEach(async () => {
    jest.resetModules();
    interpretAngelNumber.mockReset();
    ({LogEntryForm} = await import('../LogEntryForm'));
  });

  it('submits valid data', async () => {
    interpretAngelNumber.mockResolvedValue(interpretation);
    const onLogEntry = jest.fn();
    const user = userEvent.setup();
    render(<LogEntryForm onLogEntry={onLogEntry} />);

    await user.type(screen.getByLabelText(/angel number/i), '123');

    await user.click(screen.getByLabelText(/your emotion/i));
    await user.click(screen.getByText('Joyful'));

    await user.click(screen.getByLabelText(/your activity/i));
    await user.click(screen.getByText('Meditating'));

    await user.click(screen.getByRole('button', {name: /decode/i}));

    await waitFor(() => expect(onLogEntry).toHaveBeenCalled());
    expect(onLogEntry.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        angelNumber: '123',
        emotion: 'Joyful',
        activity: 'Meditating',
        interpretation,
        interpretationLanguage: 'English',
      })
    );
  });

  it('shows error for invalid angel number', async () => {
    const onLogEntry = jest.fn();
    const user = userEvent.setup();
    render(<LogEntryForm onLogEntry={onLogEntry} />);

    await user.type(screen.getByLabelText(/angel number/i), 'abc');
    await user.click(screen.getByLabelText(/your emotion/i));
    await user.click(screen.getByText('Joyful'));
    await user.click(screen.getByLabelText(/your activity/i));
    await user.click(screen.getByText('Meditating'));

    await user.click(screen.getByRole('button', {name: /decode/i}));

    expect(await screen.findByText('Invalid angel number format.')).toBeInTheDocument();
    expect(onLogEntry).not.toHaveBeenCalled();
  });
});

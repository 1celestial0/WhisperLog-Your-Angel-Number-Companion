/** @jest-environment jsdom */
import {jest} from '@jest/globals';
import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.unstable_mockModule('@/hooks/use-toast', () => ({useToast: () => ({toast: jest.fn()})}));

let TimelineEntryCard;

describe('TimelineEntryCard', () => {
  const entry = {
    id: '1',
    timestamp: new Date().toISOString(),
    angelNumber: '123',
    emotion: 'Joyful',
    activity: 'Meditating',
    interpretationLanguage: 'English',
  } as any;

  beforeEach(async () => {
    jest.resetModules();
    ({TimelineEntryCard} = await import('../TimelineEntryCard'));
  });

  it('triggers edit handler', async () => {
    const onEdit = jest.fn();
    const user = userEvent.setup();
    render(<TimelineEntryCard entry={entry} onEdit={onEdit} onDelete={jest.fn()} />);
    await user.click(screen.getByLabelText(/edit/i));
    expect(onEdit).toHaveBeenCalledWith(entry);
  });

  it('triggers delete handler after confirmation', async () => {
    const onDelete = jest.fn();
    const user = userEvent.setup();
    render(<TimelineEntryCard entry={entry} onEdit={jest.fn()} onDelete={onDelete} />);
    await user.click(screen.getByLabelText(/delete/i));
    const confirm = await screen.findByRole('button', {name: /yes, delete it/i});
    await user.click(confirm);
    expect(onDelete).toHaveBeenCalledWith('1');
  });
});

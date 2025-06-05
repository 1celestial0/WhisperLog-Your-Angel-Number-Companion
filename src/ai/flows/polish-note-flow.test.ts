import {jest} from '@jest/globals';

const prompt = jest.fn();

jest.unstable_mockModule('@/ai/genkit', () => ({
  ai: {
    definePrompt: jest.fn(() => prompt),
    defineFlow: jest.fn((_cfg, fn) => fn),
  },
}));

let polishNote;

describe('polishNoteFlow', () => {
  beforeEach(async () => {
    jest.resetModules();
    prompt.mockReset();
    ({polishNote} = await import('./polish-note-flow'));
  });

  it('returns polished text', async () => {
    const expected = {polishedNote: 'Polished'};
    prompt.mockResolvedValue({output: expected});
    const result = await polishNote({rawNote: 'hello'});
    expect(result).toEqual(expected);
  });

  it('throws when no output', async () => {
    prompt.mockResolvedValue({output: undefined});
    await expect(polishNote({rawNote: 'hello'})).rejects.toThrow('Failed to polish note using AI model.');
  });
});

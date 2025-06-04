import {jest} from '@jest/globals';

// Mock the genkit ai instance so that defineFlow returns our implementation
jest.unstable_mockModule('@/ai/genkit', () => {
  return {
    ai: {
      definePrompt: jest.fn(() => async () => ({output: {polishedNote: 'Polished'}})),
      defineFlow: jest.fn((_cfg, fn) => fn),
    },
  };
});

const {polishNote} = await import('./polish-note-flow');

describe('polishNoteFlow', () => {
  it('returns polished text', async () => {
    const result = await polishNote({rawNote: 'hello'});
    expect(result).toEqual({polishedNote: 'Polished'});
  });
});

import {jest} from '@jest/globals';

const prompt = jest.fn();

jest.unstable_mockModule('@/ai/genkit', () => ({
  ai: {
    definePrompt: jest.fn(() => prompt),
    defineFlow: jest.fn((_cfg, fn) => fn),
  },
}));

let interpretAngelNumber;

describe('interpretAngelNumberFlow', () => {
  beforeEach(async () => {
    jest.resetModules();
    prompt.mockReset();
    ({interpretAngelNumber} = await import('./interpret-angel-number'));
  });

  it('returns interpretation', async () => {
    const expected = {
      theMessage: 'msg',
      spiritualSignificance: 'sig',
      ancientWisdom: 'anc',
      context: 'ctx',
      quote: 'quote',
      metaphor: 'met',
      reflectionQuestion: 'ref',
    };
    prompt.mockResolvedValue({output: expected});
    const result = await interpretAngelNumber({number: 1, emotion: 'Joyful', activity: 'Meditating', notes: '', targetLanguage: 'English'});
    expect(result).toEqual(expected);
  });

  it('throws when no output', async () => {
    prompt.mockResolvedValue({output: undefined});
    await expect(
      interpretAngelNumber({number: 1, emotion: 'Joyful', activity: 'Meditating', notes: '', targetLanguage: 'English'})
    ).rejects.toThrow('Failed to get interpretation from AI model.');
  });
});

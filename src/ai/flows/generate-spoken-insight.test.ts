import {jest} from '@jest/globals';

const prompt = jest.fn();

jest.unstable_mockModule('@/ai/genkit', () => ({
  ai: {
    definePrompt: jest.fn(() => prompt),
    defineFlow: jest.fn((_cfg, fn) => fn),
  },
}));

let generateSpokenInsight;

describe('generateSpokenInsightFlow', () => {
  beforeEach(async () => {
    jest.resetModules();
    prompt.mockReset();
    ({generateSpokenInsight} = await import('./generate-spoken-insight'));
  });

  it('returns spoken insight', async () => {
    const expected = {spokenInsight: 'hello'};
    prompt.mockResolvedValue({output: expected});
    const result = await generateSpokenInsight({
      interpretationContent: {theMessage: '', spiritualSignificance: '', ancientWisdom: '', context: '', quote: '', metaphor: '', reflectionQuestion: ''},
      sourceLanguage: 'English',
      targetLanguage: 'English',
      voiceStyle: 'Calm',
    });
    expect(result).toEqual(expected);
  });

  it('throws when no output', async () => {
    prompt.mockResolvedValue({output: undefined});
    await expect(
      generateSpokenInsight({
        interpretationContent: {theMessage: '', spiritualSignificance: '', ancientWisdom: '', context: '', quote: '', metaphor: '', reflectionQuestion: ''},
        sourceLanguage: 'English',
        targetLanguage: 'English',
        voiceStyle: 'Calm',
      })
    ).rejects.toThrow('Failed to generate spoken insight from AI model.');
  });
});

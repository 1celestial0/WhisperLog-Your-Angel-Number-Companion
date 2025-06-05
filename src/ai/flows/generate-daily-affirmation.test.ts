import {jest} from '@jest/globals';

const prompt = jest.fn();

jest.unstable_mockModule('@/ai/genkit', () => ({
  ai: {
    definePrompt: jest.fn(() => prompt),
    defineFlow: jest.fn((_cfg, fn) => fn),
  },
}));

let generateDailyAffirmation;

describe('generateDailyAffirmationFlow', () => {
  beforeEach(async () => {
    jest.resetModules();
    prompt.mockReset();
    ({generateDailyAffirmation} = await import('./generate-daily-affirmation'));
  });

  it('returns affirmation text', async () => {
    const expected = {affirmation: 'You are great'};
    prompt.mockResolvedValue({output: expected});
    const result = await generateDailyAffirmation({loggedData: 'log', currentDate: '2020-01-01'});
    expect(result).toEqual(expected);
  });

  it('propagates errors from prompt', async () => {
    const error = new Error('boom');
    prompt.mockRejectedValue(error);
    await expect(generateDailyAffirmation({loggedData: 'log', currentDate: '2020-01-01'})).rejects.toThrow('boom');
  });
});

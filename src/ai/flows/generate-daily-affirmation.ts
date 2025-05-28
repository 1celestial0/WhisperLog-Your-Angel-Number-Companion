'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating daily affirmations based on user data and astrological events.
 *
 * - generateDailyAffirmation - A function that generates a daily affirmation.
 * - GenerateDailyAffirmationInput - The input type for the generateDailyAffirmation function.
 * - GenerateDailyAffirmationOutput - The return type for the generateDailyAffirmation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDailyAffirmationInputSchema = z.object({
  loggedData: z
    .string()
    .describe('User logged data, including angel numbers, emotions, activities, and notes.'),
  currentDate: z.string().describe('The current date.'),
  astrologicalEvents: z
    .string()
    .optional()
    .describe('A description of current astrological events.'),
});
export type GenerateDailyAffirmationInput = z.infer<typeof GenerateDailyAffirmationInputSchema>;

const GenerateDailyAffirmationOutputSchema = z.object({
  affirmation: z.string().describe('A personalized daily affirmation.'),
});
export type GenerateDailyAffirmationOutput = z.infer<typeof GenerateDailyAffirmationOutputSchema>;

export async function generateDailyAffirmation(input: GenerateDailyAffirmationInput): Promise<GenerateDailyAffirmationOutput> {
  return generateDailyAffirmationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDailyAffirmationPrompt',
  input: {schema: GenerateDailyAffirmationInputSchema},
  output: {schema: GenerateDailyAffirmationOutputSchema},
  prompt: `You are a spiritual guide who provides daily affirmations to users based on their logged data, the current date, and astrological events.

  Logged Data: {{{loggedData}}}
  Current Date: {{{currentDate}}}
  Astrological Events: {{{astrologicalEvents}}}

  Generate a personalized and inspiring daily affirmation for the user. Incorporate Vedic wisdom where relevant and appropriate.
  Consider the user's emotions, activities, and any notes they have made.
  Take into account the astrological events of the day to provide relevant guidance.
  The affirmation should be positive, encouraging, and tailored to the user's specific situation.
  Do not start with "Your daily affirmation is:" or similar. Just provide the affirmation.
  Keep the affirmation concise and impactful. Length should be between 1 and 3 sentences.
  `,
});

const generateDailyAffirmationFlow = ai.defineFlow(
  {
    name: 'generateDailyAffirmationFlow',
    inputSchema: GenerateDailyAffirmationInputSchema,
    outputSchema: GenerateDailyAffirmationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

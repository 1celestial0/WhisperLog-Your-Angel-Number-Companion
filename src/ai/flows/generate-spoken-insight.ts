'use server';

/**
 * @fileOverview Generates spoken interpretations of angel number sightings with voice and language options.
 *
 * - generateSpokenInsight - A function that generates spoken insights.
 * - GenerateSpokenInsightInput - The input type for the generateSpokenInsight function.
 * - GenerateSpokenInsightOutput - The return type for the generateSpokenInsight function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSpokenInsightInputSchema = z.object({
  number: z.string().describe('The angel number sighted.'),
  emotion: z.string().describe('The emotional state associated with the sighting.'),
  activity: z.string().describe('The activity during the sighting.'),
  notes: z.string().optional().describe('Optional notes about the sighting.'),
  language: z.string().describe('The language for the spoken interpretation.'),
  voiceStyle: z.string().describe('The voice style for the spoken interpretation.'),
});
export type GenerateSpokenInsightInput = z.infer<typeof GenerateSpokenInsightInputSchema>;

const GenerateSpokenInsightOutputSchema = z.object({
  spokenInsight: z.string().describe('The spoken interpretation of the angel number sighting.'),
});
export type GenerateSpokenInsightOutput = z.infer<typeof GenerateSpokenInsightOutputSchema>;

export async function generateSpokenInsight(input: GenerateSpokenInsightInput): Promise<GenerateSpokenInsightOutput> {
  return generateSpokenInsightFlow(input);
}

const generateSpokenInsightPrompt = ai.definePrompt({
  name: 'generateSpokenInsightPrompt',
  input: {schema: GenerateSpokenInsightInputSchema},
  output: {schema: GenerateSpokenInsightOutputSchema},
  prompt: `You are a spiritual guide providing spoken interpretations of angel number sightings.

  Interpret the following angel number sighting, considering the number, emotion, activity, and notes. Tailor the interpretation to the specified language and voice style.

  Number: {{{number}}}
  Emotion: {{{emotion}}}
  Activity: {{{activity}}}
  Notes: {{{notes}}}
  Language: {{{language}}}
  Voice Style: {{{voiceStyle}}}

  Provide a spoken interpretation that is both insightful and comforting.
  `,
});

const generateSpokenInsightFlow = ai.defineFlow(
  {
    name: 'generateSpokenInsightFlow',
    inputSchema: GenerateSpokenInsightInputSchema,
    outputSchema: GenerateSpokenInsightOutputSchema,
  },
  async input => {
    const {output} = await generateSpokenInsightPrompt(input);
    return output!;
  }
);

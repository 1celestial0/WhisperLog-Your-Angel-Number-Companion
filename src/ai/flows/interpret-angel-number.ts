// This is a server-side file
'use server';

/**
 * @fileOverview Provides spiritual interpretations of angel number sightings.
 *
 * - interpretAngelNumber - A function that interprets angel numbers.
 * - InterpretAngelNumberInput - The input type for the interpretAngelNumber function.
 * - InterpretAngelNumberOutput - The return type for the interpretAngelNumber function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterpretAngelNumberInputSchema = z.object({
  number: z.number().describe('The angel number that was sighted.'),
  emotion: z.string().describe('The emotional state of the user.'),
  activity: z.string().describe('The activity the user was engaged in.'),
  notes: z.string().optional().describe('Any notes the user made.'),
});
export type InterpretAngelNumberInput = z.infer<
  typeof InterpretAngelNumberInputSchema
>;

const InterpretAngelNumberOutputSchema = z.object({
  interpretation: z.string().describe('The spiritual interpretation of the angel number sighting.'),
});
export type InterpretAngelNumberOutput = z.infer<
  typeof InterpretAngelNumberOutputSchema
>;

export async function interpretAngelNumber(
  input: InterpretAngelNumberInput
): Promise<InterpretAngelNumberOutput> {
  return interpretAngelNumberFlow(input);
}

const interpretAngelNumberPrompt = ai.definePrompt({
  name: 'interpretAngelNumberPrompt',
  input: {schema: InterpretAngelNumberInputSchema},
  output: {schema: InterpretAngelNumberOutputSchema},
  prompt: `You are a spiritual advisor providing guidance based on angel numbers.

  Interpret the meaning of the angel number sighting based on the following information:

  Number: {{{number}}}
  Emotion: {{{emotion}}}
  Activity: {{{activity}}}
  Notes: {{{notes}}}

  Provide a personalized spiritual interpretation of the angel number sighting, incorporating the number itself, the user's emotional state, the activity they were engaged in, and any notes they made.  Reason when to incorporate Vedic wisdom in your analysis.
  `,
});

const interpretAngelNumberFlow = ai.defineFlow(
  {
    name: 'interpretAngelNumberFlow',
    inputSchema: InterpretAngelNumberInputSchema,
    outputSchema: InterpretAngelNumberOutputSchema,
  },
  async input => {
    const {output} = await interpretAngelNumberPrompt(input);
    return output!;
  }
);

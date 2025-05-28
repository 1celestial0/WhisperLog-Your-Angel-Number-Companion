
'use server';
/**
 * @fileOverview A Genkit flow to polish user-inputted notes.
 *
 * - polishNote - A function that takes raw text and returns a polished version.
 * - PolishNoteInput - The input type for the polishNote function.
 * - PolishNoteOutput - The return type for the polishNote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PolishNoteInputSchema = z.object({
  rawNote: z.string().describe('The raw, potentially unedited note text from the user, possibly from voice input.'),
});
export type PolishNoteInput = z.infer<typeof PolishNoteInputSchema>;

const PolishNoteOutputSchema = z.object({
  polishedNote: z.string().describe('The polished version of the note, with corrected grammar, improved clarity, and conciseness, while preserving the original meaning.'),
});
export type PolishNoteOutput = z.infer<typeof PolishNoteOutputSchema>;

export async function polishNote(input: PolishNoteInput): Promise<PolishNoteOutput> {
  return polishNoteFlow(input);
}

const polishNotePrompt = ai.definePrompt({
  name: 'polishNotePrompt',
  input: {schema: PolishNoteInputSchema},
  output: {schema: PolishNoteOutputSchema},
  prompt: `You are an expert editor. Your task is to refine the user's note provided below.
The note might be from voice input, so it could be informal or contain minor errors.
Correct any grammatical mistakes, improve clarity, and enhance conciseness.
Crucially, you MUST strictly preserve the original meaning and context of the note. Do not add new information or change the core message.
Do not add any introductory phrases, greetings, or sign-offs. Just return the polished note text directly.

Raw note:
"{{{rawNote}}}"
`,
});

const polishNoteFlow = ai.defineFlow(
  {
    name: 'polishNoteFlow',
    inputSchema: PolishNoteInputSchema,
    outputSchema: PolishNoteOutputSchema,
  },
  async input => {
    const {output} = await polishNotePrompt(input);
    if (!output) {
      throw new Error('Failed to polish note using AI model.');
    }
    return output;
  }
);

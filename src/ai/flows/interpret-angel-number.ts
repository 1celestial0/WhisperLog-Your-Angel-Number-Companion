
// This is a server-side file
'use server';

/**
 * @fileOverview Provides spiritual interpretations of angel number sightings in multiple languages.
 *
 * - interpretAngelNumber - A function that interprets angel numbers.
 * - InterpretAngelNumberInput - The input type for the interpretAngelNumber function.
 * - InterpretAngelNumberOutput - The return type for the interpretAngelNumber function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { languages } from '@/lib/types';

const InterpretAngelNumberInputSchema = z.object({
  number: z.number().describe('The angel number that was sighted.'),
  emotion: z.string().describe('The emotional state of the user.'),
  activity: z.string().describe('The activity the user was engaged in.'),
  notes: z.string().optional().describe('Any notes the user made.'),
  targetLanguage: z.enum(languages).describe('The language in which the interpretation should be generated (e.g., English, Bengali, Hindi).'),
});
export type InterpretAngelNumberInput = z.infer<
  typeof InterpretAngelNumberInputSchema
>;

const InterpretAngelNumberOutputSchema = z.object({
  theMessage: z.string().describe("The core meaning of the angel number sighting (e.g., 'Alignment and manifestation'). Provide a detailed explanation, typically 2-3 sentences."),
  spiritualSignificance: z.string().describe("The deeper spiritual context (e.g., 'A sign of spiritual awakening'). Elaborate on this, around 2-3 sentences."),
  ancientWisdom: z.string().describe("Connections to traditional wisdom or numerology (e.g., 'In Vedic numerology, 111 represents the trinity'). Explain this connection in 2-3 sentences."),
  context: z.string().describe("Personalized insight based on the user's emotion, activity, and notes (e.g., 'Your joyful state while meditating suggests alignment'). Offer detailed, personalized advice in 2-3 sentences."),
  quote: z.string().describe("An inspirational saying or quote related to the interpretation (e.g., 'When you make a choice, you change the future. - Deepak Chopra')."),
  metaphor: z.string().describe("Poetic imagery or a metaphor to illustrate the message (e.g., 'Like seeds sprouting, your thoughts are becoming reality'). Make this evocative and illustrative, 1-2 sentences."),
  reflectionQuestion: z.string().describe("An introspection prompt for the user (e.g., 'What intentions are you ready to manifest?'). This should be a thoughtful, open-ended question."),
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
  prompt: `You are a highly spiritual, practical, wise, and friendly mentor. Your expertise lies in numerology, astrology, cosmic wisdom, and guiding individuals on their spiritual path.
Interpret the angel number {{{number}}} for a user who was feeling {{{emotion}}} while engaged in "{{{activity}}}".
Their personal notes about the sighting are: "{{{notes}}}"

Generate the entire interpretation in the language: {{{targetLanguage}}}.
Your tone should be empathetic, insightful, empowering, and deeply resonant. Use cosmic, poetic language where appropriate, but ensure the advice is also practical and actionable.

Respond with the following structured interpretation. Each section should be detailed and comprehensive:

1.  **The Message**: (Elaborate on the core meaning of the number, its immediate relevance. Aim for 2-4 sentences.)
2.  **Spiritual Significance**: (Explore the deeper spiritual context, connections to awakening, and higher self. Aim for 2-4 sentences.)
3.  **Ancient Wisdom**: (Connect to numerology, Vedic wisdom, or other relevant ancient traditions. Explain the connection clearly. Aim for 2-4 sentences.)
4.  **Context**: (Personalize the interpretation profoundly, weaving in the user's emotion, activity, and notes to offer tailored guidance and understanding. Aim for 2-4 sentences.)
5.  **Quote**: (Provide an inspirational and fitting quote that resonates with the message and offers wisdom.)
6.  **Metaphor**: (Offer a vivid, poetic metaphor to illuminate the interpretation and make it memorable. Aim for 1-3 sentences.)
7.  **Reflection Question**: (Pose a thoughtful, open-ended question that encourages deep introspection and personal growth for the user.)

Ensure each section is clearly defined and provides insightful, uplifting guidance in {{{targetLanguage}}}. The interpretation should feel like a personal message from a wise spiritual mentor.
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
    if (!output) {
      throw new Error('Failed to get interpretation from AI model.');
    }
    return output;
  }
);

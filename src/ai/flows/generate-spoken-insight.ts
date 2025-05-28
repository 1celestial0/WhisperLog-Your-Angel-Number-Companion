
'use server';

/**
 * @fileOverview Generates spoken interpretations of angel number sightings with voice and language options.
 * The flow takes a structured interpretation (potentially in English, Bengali, or Hindi) and generates a spoken version
 * in the target language (English, Bengali, or Hindi).
 *
 * - generateSpokenInsight - A function that generates spoken insights.
 * - GenerateSpokenInsightInput - The input type for the generateSpokenInsight function.
 * - GenerateSpokenInsightOutput - The return type for the generateSpokenInsight function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { languages } from '@/lib/types'; // Import languages for schema

// Define the structure of the interpretation content we expect to receive
const SpokenInterpretationContentSchema = z.object({
  theMessage: z.string().describe("The core meaning of the angel number sighting."),
  spiritualSignificance: z.string().describe("The deeper spiritual context."),
  ancientWisdom: z.string().describe("Connections to traditional wisdom or numerology."),
  context: z.string().describe("Personalized insight based on the user's emotion, activity, and notes."),
  quote: z.string().describe("An inspirational saying or quote related to the interpretation."),
  metaphor: z.string().describe("Poetic imagery or a metaphor to illustrate the message."),
  reflectionQuestion: z.string().describe("An introspection prompt for the user."),
}).describe("The key fields of the spiritual interpretation, which could be in English, Bengali, or Hindi.");


const GenerateSpokenInsightInputSchema = z.object({
  interpretationContent: SpokenInterpretationContentSchema,
  sourceLanguage: z.enum(languages).describe('The language of the provided interpretationContent (e.g., English, Bengali, Hindi).'),
  targetLanguage: z.enum(languages).describe('The target language for the spoken interpretation (e.g., English, Bengali, Hindi).'),
  voiceStyle: z.string().describe('The desired voice style for the spoken interpretation.'),
});
export type GenerateSpokenInsightInput = z.infer<typeof GenerateSpokenInsightInputSchema>;

const GenerateSpokenInsightOutputSchema = z.object({
  spokenInsight: z.string().describe('The spoken interpretation, translated (if necessary) into the target language and adapted for audio delivery.'),
});
export type GenerateSpokenInsightOutput = z.infer<typeof GenerateSpokenInsightOutputSchema>;

export async function generateSpokenInsight(input: GenerateSpokenInsightInput): Promise<GenerateSpokenInsightOutput> {
  return generateSpokenInsightFlow(input);
}

const generateSpokenInsightPrompt = ai.definePrompt({
  name: 'generateSpokenInsightPrompt',
  input: {schema: GenerateSpokenInsightInputSchema},
  output: {schema: GenerateSpokenInsightOutputSchema},
  prompt: `You are a spiritual guide. You will be given a spiritual interpretation of an angel number sighting.
The interpretation provided is in {{{sourceLanguage}}}.
Your task is to prepare this interpretation to be spoken aloud in the specified target language: {{{targetLanguage}}}, using the desired voice style: {{{voiceStyle}}}.

The interpretation details (in {{{sourceLanguage}}}) are:
The Message: {{{interpretationContent.theMessage}}}
Spiritual Significance: {{{interpretationContent.spiritualSignificance}}}
Ancient Wisdom: {{{interpretationContent.ancientWisdom}}}
Context: {{{interpretationContent.context}}}
Quote: {{{interpretationContent.quote}}}
Metaphor: {{{interpretationContent.metaphor}}}
Reflection Question: {{{interpretationContent.reflectionQuestion}}}

If the source language ({{{sourceLanguage}}}) and target language ({{{targetLanguage}}}) are the same, primarily focus on adapting the text for natural, engaging spoken delivery, keeping it insightful and comforting, suitable for the {{{voiceStyle}}}.
If the source language and target language are different, you MUST translate all relevant parts of the interpretation into {{{targetLanguage}}} first, and then adapt it for spoken delivery.
If the original interpretation is lengthy, you can summarize key aspects to ensure the spoken version is concise yet comprehensive.
Focus on clarity and a spiritual tone.
The output should ONLY be the final spoken text in {{{targetLanguage}}}.
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
    if (!output) {
      throw new Error('Failed to generate spoken insight from AI model.');
    }
    return output;
  }
);

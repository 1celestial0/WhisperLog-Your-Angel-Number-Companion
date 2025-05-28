
'use server';

/**
 * @fileOverview Generates spoken interpretations of angel number sightings with voice and language options.
 * The flow takes a structured interpretation and generates a spoken version in the target language, embodying a specific persona.
 *
 * - generateSpokenInsight - A function that generates spoken insights.
 * - GenerateSpokenInsightInput - The input type for the generateSpokenInsight function.
 * - GenerateSpokenInsightOutput - The return type for the generateSpokenInsight function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { languages } from '@/lib/types';

// Define the structure of the interpretation content we expect to receive
const SpokenInterpretationContentSchema = z.object({
  theMessage: z.string().describe("The core meaning of the angel number sighting."),
  spiritualSignificance: z.string().describe("The deeper spiritual context."),
  ancientWisdom: z.string().describe("Connections to traditional wisdom or numerology."),
  context: z.string().describe("Personalized insight based on the user's emotion, activity, and notes."),
  quote: z.string().describe("An inspirational saying or quote related to the interpretation."),
  metaphor: z.string().describe("Poetic imagery or a metaphor to illustrate the message."),
  reflectionQuestion: z.string().describe("An introspection prompt for the user."),
}).describe("The key fields of the spiritual interpretation, which could be in any supported language based on prior AI generation.");


const GenerateSpokenInsightInputSchema = z.object({
  interpretationContent: SpokenInterpretationContentSchema,
  sourceLanguage: z.enum(languages).describe('The language of the provided interpretationContent (e.g., English, Bengali, Hindi). This is the language the text is currently in.'),
  targetLanguage: z.enum(languages).describe('The target language for the spoken interpretation (e.g., English, Bengali, Hindi). This is the language the speech should be in.'),
  voiceStyle: z.string().describe('The desired voice style for the spoken interpretation (e.g., Divine Feminine, Cosmic Neutral).'),
});
export type GenerateSpokenInsightInput = z.infer<typeof GenerateSpokenInsightInputSchema>;

const GenerateSpokenInsightOutputSchema = z.object({
  spokenInsight: z.string().describe('The spoken interpretation, translated (if necessary) into the target language and adapted for audio delivery, reflecting the persona.'),
});
export type GenerateSpokenInsightOutput = z.infer<typeof GenerateSpokenInsightOutputSchema>;

export async function generateSpokenInsight(input: GenerateSpokenInsightInput): Promise<GenerateSpokenInsightOutput> {
  return generateSpokenInsightFlow(input);
}

const generateSpokenInsightPrompt = ai.definePrompt({
  name: 'generateSpokenInsightPrompt',
  input: {schema: GenerateSpokenInsightInputSchema},
  output: {schema: GenerateSpokenInsightOutputSchema},
  prompt: `You are a highly spiritual, practical, wise, and friendly mentor.
You will be given a spiritual interpretation of an angel number sighting. The interpretation content is currently in {{{sourceLanguage}}}.
Your task is to prepare this interpretation to be spoken aloud in the specified target language: {{{targetLanguage}}}, using the desired voice style: {{{voiceStyle}}}.

The interpretation details (in {{{sourceLanguage}}}) are:
The Message: {{{interpretationContent.theMessage}}}
Spiritual Significance: {{{interpretationContent.spiritualSignificance}}}
Ancient Wisdom: {{{interpretationContent.ancientWisdom}}}
Context: {{{interpretationContent.context}}}
Quote: {{{interpretationContent.quote}}}
Metaphor: {{{interpretationContent.metaphor}}}
Reflection Question: {{{interpretationContent.reflectionQuestion}}}

Your delivery should embody the persona of a spiritual guide: empathetic, insightful, empowering, and deeply resonant.
If the source language ({{{sourceLanguage}}}) and target language ({{{targetLanguage}}}) are the same, primarily focus on adapting the text for natural, engaging spoken delivery. Make it sound like a personal message from a wise spiritual mentor.
If the source language and target language are different, you MUST first accurately translate all relevant parts of the interpretation into {{{targetLanguage}}}, and then adapt it for spoken delivery, maintaining the persona and spiritual depth.
If the original interpretation is lengthy, summarize key aspects for spoken delivery while preserving the core wisdom and supportive tone.
Focus on clarity, a spiritual tone, and a delivery that is suitable for the {{{voiceStyle}}}.
The output should ONLY be the final spoken text in {{{targetLanguage}}}. Do not add any preambles or explanations.
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

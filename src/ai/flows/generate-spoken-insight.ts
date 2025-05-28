
'use server';

/**
 * @fileOverview Generates spoken interpretations of angel number sightings with voice and language options.
 * The flow takes a structured interpretation (already in English) and generates a spoken version
 * in the target language (English, Bengali, or Hindi).
 *
 * - generateSpokenInsight - A function that generates spoken insights.
 * - GenerateSpokenInsightInput - The input type for the generateSpokenInsight function.
 * - GenerateSpokenInsightOutput - The return type for the generateSpokenInsight function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the structure of the interpretation content we expect to receive
const SpokenInterpretationContentSchema = z.object({
  theMessage: z.string().describe("The core meaning of the angel number sighting."),
  spiritualSignificance: z.string().describe("The deeper spiritual context."),
  ancientWisdom: z.string().describe("Connections to traditional wisdom or numerology."),
  context: z.string().describe("Personalized insight based on the user's emotion, activity, and notes."),
  quote: z.string().describe("An inspirational saying or quote related to the interpretation."),
  metaphor: z.string().describe("Poetic imagery or a metaphor to illustrate the message."),
  reflectionQuestion: z.string().describe("An introspection prompt for the user."),
}).describe("The key fields of the spiritual interpretation, typically generated in English, to be translated and spoken.");


const GenerateSpokenInsightInputSchema = z.object({
  interpretationContent: SpokenInterpretationContentSchema,
  language: z.string().describe('The target language for the spoken interpretation (e.g., English, Bengali, Hindi).'),
  voiceStyle: z.string().describe('The desired voice style for the spoken interpretation.'),
});
export type GenerateSpokenInsightInput = z.infer<typeof GenerateSpokenInsightInputSchema>;

const GenerateSpokenInsightOutputSchema = z.object({
  spokenInsight: z.string().describe('The spoken interpretation, translated into the target language and adapted for audio delivery.'),
});
export type GenerateSpokenInsightOutput = z.infer<typeof GenerateSpokenInsightOutputSchema>;

export async function generateSpokenInsight(input: GenerateSpokenInsightInput): Promise<GenerateSpokenInsightOutput> {
  return generateSpokenInsightFlow(input);
}

const generateSpokenInsightPrompt = ai.definePrompt({
  name: 'generateSpokenInsightPrompt',
  input: {schema: GenerateSpokenInsightInputSchema},
  output: {schema: GenerateSpokenInsightOutputSchema},
  prompt: `You are a spiritual guide. You will be given a spiritual interpretation of an angel number sighting which is originally in English.
Your task is to prepare this interpretation to be spoken aloud in the specified target language and voice style.

The original English interpretation details are:
The Message: {{{interpretationContent.theMessage}}}
Spiritual Significance: {{{interpretationContent.spiritualSignificance}}}
Ancient Wisdom: {{{interpretationContent.ancientWisdom}}}
Context: {{{interpretationContent.context}}}
Quote: {{{interpretationContent.quote}}}
Metaphor: {{{interpretationContent.metaphor}}}
Reflection Question: {{{interpretationContent.reflectionQuestion}}}

Target language for spoken output: {{{language}}}
Desired voice style (aesthetic guidance for tone): {{{voiceStyle}}}

Please provide the complete spoken text translated into {{{language}}}. Make it sound natural and engaging for spoken delivery, keeping it insightful and comforting.
You should translate all relevant parts of the interpretation (such as The Message, Spiritual Significance, Context, and Reflection Question) into {{{language}}}.
If the original interpretation is lengthy, you can summarize key aspects to ensure the spoken version is concise yet comprehensive.
Focus on clarity and a spiritual tone suitable for the voice style.
The output should ONLY be the spoken text in {{{language}}}.
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

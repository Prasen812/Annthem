'use server';
/**
 * @fileOverview An AI song advisor that analyzes listening history and suggests potential music preferences.
 *
 * - getSongAdvice - A function that provides song recommendations based on listening history.
 * - SongAdvisorInput - The input type for the getSongAdvice function.
 * - SongAdvisorOutput - The return type for the getSongAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SongAdvisorInputSchema = z.object({
  listeningHistory: z
    .array(z.string())
    .describe('An array of song IDs representing the user\'s listening history.'),
  currentTasteDescription: z
    .string()
    .optional()
    .describe('Optional description of the user\'s current musical taste.'),
});
export type SongAdvisorInput = z.infer<typeof SongAdvisorInputSchema>;

const SongAdvisorOutputSchema = z.object({
  suggestedPreferences: z
    .array(z.string())
    .describe('An array of potential music preferences based on listening history.'),
  reasoning: z
    .string()
    .describe('Explanation of why these preferences are suggested.'),
});
export type SongAdvisorOutput = z.infer<typeof SongAdvisorOutputSchema>;

export async function getSongAdvice(input: SongAdvisorInput): Promise<SongAdvisorOutput> {
  return songAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'songAdvisorPrompt',
  input: {schema: SongAdvisorInputSchema},
  output: {schema: SongAdvisorOutputSchema},
  prompt: `You are an AI music advisor. You analyze a user\'s listening history and suggest potential music preferences.

Listening History: {{{listeningHistory}}}
Current Taste Description: {{{currentTasteDescription}}}

Based on this information, suggest potential music preferences and explain your reasoning.

Format your response as follows:

Suggested Preferences: [preference1, preference2, ...]
Reasoning: Explanation of why these preferences are suggested.`,
});

const songAdvisorFlow = ai.defineFlow(
  {
    name: 'songAdvisorFlow',
    inputSchema: SongAdvisorInputSchema,
    outputSchema: SongAdvisorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

'use server';

/**
 * @fileOverview Summarizes meeting notes to provide a quick overview of key decisions and action items.
 *
 * - summarizeMeetingNotes - A function that summarizes meeting notes.
 * - SummarizeMeetingNotesInput - The input type for the summarizeMeetingNotes function.
 * - SummarizeMeetingNotesOutput - The return type for the summarizeMeetingNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMeetingNotesInputSchema = z.object({
  notes: z.string().describe('The meeting notes to summarize.'),
});
export type SummarizeMeetingNotesInput = z.infer<typeof SummarizeMeetingNotesInputSchema>;

const SummarizeMeetingNotesOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the meeting notes.'),
  progress: z.string().describe('Progress of summary generation.')
});
export type SummarizeMeetingNotesOutput = z.infer<typeof SummarizeMeetingNotesOutputSchema>;

export async function summarizeMeetingNotes(
  input: SummarizeMeetingNotesInput
): Promise<SummarizeMeetingNotesOutput> {
  return summarizeMeetingNotesFlow(input);
}

const summarizeMeetingNotesPrompt = ai.definePrompt({
  name: 'summarizeMeetingNotesPrompt',
  input: {schema: SummarizeMeetingNotesInputSchema},
  output: {schema: SummarizeMeetingNotesOutputSchema},
  prompt: `You are an AI assistant that summarizes meeting notes.

  Please provide a concise summary of the following meeting notes, highlighting key decisions and action items:

  {{notes}}

  Summary:`, config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  },
});

const summarizeMeetingNotesFlow = ai.defineFlow(
  {
    name: 'summarizeMeetingNotesFlow',
    inputSchema: SummarizeMeetingNotesInputSchema,
    outputSchema: SummarizeMeetingNotesOutputSchema,
  },
  async input => {
    const {output} = await summarizeMeetingNotesPrompt(input);
    return { ...output!, progress: 'Generated a short summary of the provided meeting notes.' };
  }
);

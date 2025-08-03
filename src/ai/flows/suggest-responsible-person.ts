'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting the most suitable team member to assign to a task.
 *
 * - suggestResponsiblePerson - A function that suggests a responsible person for a task.
 * - SuggestResponsiblePersonInput - The input type for the suggestResponsiblePerson function.
 * - SuggestResponsiblePersonOutput - The return type for the suggestResponsiblePerson function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestResponsiblePersonInputSchema = z.object({
  taskDescription: z.string().describe('The description of the task to be assigned.'),
  teamMembers: z
    .array(z.object({name: z.string(), expertise: z.string(), currentWorkload: z.number()}))
    .describe('An array of team members with their names, expertise, and current workload.'),
});
export type SuggestResponsiblePersonInput = z.infer<typeof SuggestResponsiblePersonInputSchema>;

const SuggestResponsiblePersonOutputSchema = z.object({
  suggestedPerson: z.string().describe('The name of the suggested team member.'),
  reason: z.string().describe('The reason for suggesting this team member.'),
});
export type SuggestResponsiblePersonOutput = z.infer<typeof SuggestResponsiblePersonOutputSchema>;

export async function suggestResponsiblePerson(
  input: SuggestResponsiblePersonInput
): Promise<SuggestResponsiblePersonOutput> {
  return suggestResponsiblePersonFlow(input);
}

const suggestResponsiblePersonPrompt = ai.definePrompt({
  name: 'suggestResponsiblePersonPrompt',
  input: {schema: SuggestResponsiblePersonInputSchema},
  output: {schema: SuggestResponsiblePersonOutputSchema},
  prompt: `You are an AI assistant helping project managers assign tasks to team members.
Given the following task description and a list of team members with their expertise and current workload, suggest the most suitable team member to assign to the task.

Task Description: {{{taskDescription}}}

Team Members:
{{#each teamMembers}}
- Name: {{name}}, Expertise: {{expertise}}, Current Workload: {{currentWorkload}}
{{/each}}

Consider the team member's expertise and current workload when making your suggestion. The suggested person should have the relevant expertise and a manageable workload.

Return the name of the suggested team member and a brief reason for your suggestion.
`,
});

const suggestResponsiblePersonFlow = ai.defineFlow(
  {
    name: 'suggestResponsiblePersonFlow',
    inputSchema: SuggestResponsiblePersonInputSchema,
    outputSchema: SuggestResponsiblePersonOutputSchema,
  },
  async input => {
    const {output} = await suggestResponsiblePersonPrompt(input);
    return output!;
  }
);

'use server';

/**
 * @fileOverview This file defines a Genkit flow for breaking down a project goal into a list of actionable tasks.
 *
 * - breakdownProjectGoal - A function that takes a project goal and returns a list of tasks.
 * - BreakdownProjectGoalInput - The input type for the breakdownProjectGoal function.
 * - BreakdownProjectGoalOutput - The return type for the breakdownProjectGoal function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BreakdownProjectGoalInputSchema = z.object({
  projectGoal: z.string().describe('The main goal of the project.'),
});
export type BreakdownProjectGoalInput = z.infer<typeof BreakdownProjectGoalInputSchema>;

const BreakdownProjectGoalOutputSchema = z.object({
  tasks: z.array(
    z.object({
      title: z.string().describe('A short, actionable title for the task.'),
      description: z.string().describe('A brief description of what the task entails.'),
    })
  ).describe('An array of tasks to achieve the project goal.'),
});
export type BreakdownProjectGoalOutput = z.infer<typeof BreakdownProjectGoalOutputSchema>;

export async function breakdownProjectGoal(
  input: BreakdownProjectGoalInput
): Promise<BreakdownProjectGoalOutput> {
  return breakdownProjectGoalFlow(input);
}

const breakdownProjectGoalPrompt = ai.definePrompt({
  name: 'breakdownProjectGoalPrompt',
  input: { schema: BreakdownProjectGoalInputSchema },
  output: { schema: BreakdownProjectGoalOutputSchema },
  prompt: `You are an expert project manager. Your task is to break down a high-level project goal into a list of smaller, actionable tasks.
For each task, provide a clear title and a concise description.

Project Goal: {{{projectGoal}}}

Generate a list of tasks that would be a good starting point for this project. Focus on the initial phases like planning, design, and setup.
`,
});

const breakdownProjectGoalFlow = ai.defineFlow(
  {
    name: 'breakdownProjectGoalFlow',
    inputSchema: BreakdownProjectGoalInputSchema,
    outputSchema: BreakdownProjectGoalOutputSchema,
  },
  async (input) => {
    const { output } = await breakdownProjectGoalPrompt(input);
    return output!;
  }
);

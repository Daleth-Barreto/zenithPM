'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, UserCheck, Loader2 } from 'lucide-react';
import { suggestResponsiblePerson } from '@/ai/flows/suggest-responsible-person';
import type { Project, Task } from '@/lib/types';

interface TaskAssignerProps {
  task: Task;
  project: Project;
}

export function TaskAssigner({ task, project }: TaskAssignerProps) {
  const [suggestion, setSuggestion] = useState<{ person: string; reason: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuggest = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestion(null);

    try {
      const result = await suggestResponsiblePerson({
        taskDescription: task.description || task.title,
        teamMembers: project.team.map(member => ({
          name: member.name,
          expertise: member.expertise,
          currentWorkload: member.currentWorkload,
        })),
      });
      setSuggestion({ person: result.suggestedPerson, reason: result.reason });
    } catch (e) {
      setError('Failed to get suggestion. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-sm">AI Suggestions</h4>
      <Button onClick={handleSuggest} disabled={isLoading} variant="outline" className="w-full">
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        Suggest Assignee
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {suggestion && (
        <Alert>
          <UserCheck className="h-4 w-4" />
          <AlertTitle>Suggested: {suggestion.person}</AlertTitle>
          <AlertDescription>{suggestion.reason}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

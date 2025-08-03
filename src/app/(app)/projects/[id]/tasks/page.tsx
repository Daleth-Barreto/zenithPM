
'use client';

import { TaskList } from '@/components/tasks/task-list';
import type { Project } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';


export default function ProjectTasksPage({ project }: { project: Project }) {
  if (!project) {
    return (
      <div className="p-4 md:p-8 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <TaskList project={project} />
    </div>
  );
}

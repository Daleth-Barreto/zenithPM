
'use client';

import { TaskList } from '@/components/tasks/task-list';
import { useProject } from '../layout';
import { Skeleton } from '@/components/ui/skeleton';


export default function ProjectTasksPage() {
  const project = useProject();

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

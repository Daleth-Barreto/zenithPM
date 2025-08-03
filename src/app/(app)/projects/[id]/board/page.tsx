
'use client';

import { KanbanBoard } from '@/components/tasks/kanban-board';
import type { Project } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

// The project prop is passed down from the ProjectLayout
export default function ProjectBoardPage({ project }: { project: Project }) {
  if (!project) {
    return (
        <div className="p-4 md:p-8 flex-1 space-x-4 flex overflow-x-auto h-full">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col w-72 lg:w-80 flex-shrink-0 space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-28 w-full" />
                </div>
            ))}
        </div>
    )
  }

  return <KanbanBoard project={project} />;
}

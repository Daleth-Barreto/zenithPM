
'use client';

import { KanbanBoard } from '@/components/tasks/kanban-board';
import { useProject } from '../layout';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectBoardPage() {
  const project = useProject();

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

  return (
    <div className="flex-1 overflow-auto p-4 md:p-8 pt-0">
        <KanbanBoard project={project} />
    </div>
  );
}

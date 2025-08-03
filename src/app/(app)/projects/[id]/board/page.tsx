
'use client';

import { KanbanBoard } from '@/components/tasks/kanban-board';
import { getProjectById } from '@/lib/firebase-services';
import { useEffect, useState } from 'react';
import type { Project } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';


export default function ProjectBoardPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
        getProjectById(params.id).then(p => {
            if (p) {
                setProject(p);
            }
            setLoading(false);
        });
    }
  }, [params.id]);


  if (loading) {
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

  if (!project) {
    return <div>Project not found</div>;
  }

  return <KanbanBoard project={project} />;
}

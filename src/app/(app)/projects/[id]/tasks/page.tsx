
'use client';

import { getProjectById } from '@/lib/firebase-services';
import { TaskList } from '@/components/tasks/task-list';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Project } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';


export default function ProjectTasksPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      getProjectById(projectId).then(p => {
        if(p) {
          setProject(p)
        }
        setLoading(false)
      })
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <TaskList project={project} />
    </div>
  );
}

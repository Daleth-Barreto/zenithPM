
'use client';

import { useEffect, useState } from 'react';
import { ProjectHeader } from '@/components/projects/project-header';
import { getProjectById } from '@/lib/firebase-services';
import { notFound, useParams } from 'next/navigation';
import type { Project } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      getProjectById(projectId).then(proj => {
        if (proj) {
          setProject(proj);
        } else {
          // Project not found
        }
        setLoading(false);
      });
    }
  }, [projectId]);

  if (loading) {
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 md:p-8 space-y-3">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-5 w-3/4" />
            </div>
             <div className="px-4 md:px-8 border-b">
                 <Skeleton className="h-10 w-96" />
            </div>
             <div className="flex-1 p-8">
                 <Skeleton className="h-full w-full" />
            </div>
        </div>
    );
  }

  if (!project) {
    notFound();
  }

  return (
    <div className="flex flex-col h-full">
      <ProjectHeader project={project} />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

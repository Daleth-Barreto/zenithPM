
'use client';

import React, { useEffect, useState, createContext, useContext } from 'react';
import { ProjectHeader } from '@/components/projects/project-header';
import { getProjectById } from '@/lib/firebase-services';
import { notFound, useParams } from 'next/navigation';
import type { Project } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

// 1. Create a context for the project
const ProjectContext = createContext<Project | null>(null);

// Custom hook to use the project context
export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject debe ser utilizado dentro de un ProjectProvider');
  }
  return context;
};

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
          // Project not found, handle this case
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
    <ProjectContext.Provider value={project}>
      <div className="flex flex-col h-full">
        <ProjectHeader project={project} />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </ProjectContext.Provider>
  );
}

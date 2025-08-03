
'use client';

import { useEffect, useState } from 'react';
import { FolderKanban } from 'lucide-react';
import { ProjectCard } from '@/components/projects/project-card';
import { NewProjectDialog } from '@/components/projects/new-project-dialog';
import { getProjectsForUser } from '@/lib/firebase-services';
import { useAuth } from '@/contexts/auth-context';
import type { Project } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const unsubscribe = getProjectsForUser(user.uid, (projects) => {
        setProjects(projects);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const onProjectCreated = (newProject: Project) => {
    // No need to manually update the state here.
    // The onSnapshot listener from getProjectsForUser will handle it.
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight" data-tour="dashboard-title">Portafolio de Proyectos</h2>
        <div className="flex items-center space-x-2">
          <NewProjectDialog onProjectCreated={onProjectCreated} />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
             <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[160px] w-full rounded-xl" />
              <div className="space-y-2 p-6 pt-0">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-8 sm:mt-16 py-16 sm:py-24">
          <div className="flex flex-col items-center gap-2 text-center p-4">
            <FolderKanban className="h-16 w-16 text-muted-foreground" />
            <h3 className="text-2xl font-bold tracking-tight">Aún no hay proyectos</h3>
            <p className="text-sm text-muted-foreground">
              Comienza creando tu primer proyecto.
            </p>
            <div className="mt-4">
              <NewProjectDialog onProjectCreated={onProjectCreated} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { FolderKanban, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/projects/project-card';
import { NewProjectDialog } from '@/components/projects/new-project-dialog';
import { mockProjects } from '@/lib/mock-data';

export default function DashboardPage() {
  const projects = mockProjects;
  // const projects = []; // To test empty state

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Project Portfolio</h2>
        <div className="flex items-center space-x-2">
          <NewProjectDialog />
        </div>
      </div>

      {projects.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-16 py-24">
          <div className="flex flex-col items-center gap-2 text-center">
            <FolderKanban className="h-16 w-16 text-muted-foreground" />
            <h3 className="text-2xl font-bold tracking-tight">No projects yet</h3>
            <p className="text-sm text-muted-foreground">
              Get started by creating your first project.
            </p>
            <div className="mt-4">
              <NewProjectDialog />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

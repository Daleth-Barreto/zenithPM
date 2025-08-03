import { ProjectHeader } from '@/components/projects/project-header';
import { getProjectById } from '@/lib/mock-data';
import { notFound } from 'next/navigation';

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const project = getProjectById(params.id);

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

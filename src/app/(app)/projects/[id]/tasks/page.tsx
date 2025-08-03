import { getProjectById } from '@/lib/mock-data';
import { TaskList } from '@/components/tasks/task-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProjectTasksPage({ params }: { params: { id: string } }) {
  const project = getProjectById(params.id);

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <TaskList project={project} />
    </div>
  );
}

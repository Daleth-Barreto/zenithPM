import { KanbanBoard } from '@/components/tasks/kanban-board';
import { getProjectById } from '@/lib/mock-data';

// This is a workaround for the react-beautiful-dnd library that requires a browser environment.
// In a real application, you might use a different library or conditionally render on the client.
import 'react-beautiful-dnd-cjs-patch';

export default function ProjectBoardPage({ params }: { params: { id: string } }) {
  const project = getProjectById(params.id);

  if (!project) {
    return <div>Project not found</div>;
  }

  return <KanbanBoard project={project} />;
}

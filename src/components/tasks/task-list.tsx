
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
} from 'lucide-react';
import type { Task, Project } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { getTasksForProject } from '@/lib/firebase-services';

interface TaskListProps {
  project: Project;
}

const priorityIcons: Record<Task['priority'], React.ReactNode> = {
  low: <ArrowDown className="h-4 w-4 text-gray-500" />,
  medium: <ArrowRight className="h-4 w-4 text-yellow-500" />,
  high: <ArrowUp className="h-4 w-4 text-orange-500" />,
  urgent: <ArrowUp className="h-4 w-4 text-red-500" />,
};

const statusColors: Record<Task['status'], string> = {
  backlog: 'bg-gray-500',
  'in-progress': 'bg-blue-500',
  review: 'bg-purple-500',
  done: 'bg-green-500',
};

const priorityLabels: Record<Task['priority'], string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
};

const statusLabels: Record<Task['status'], string> = {
  backlog: 'Pendiente',
  'in-progress': 'En progreso',
  review: 'En revisión',
  done: 'Hecho',
};

export function TaskList({ project }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (project.id) {
      const unsubscribe = getTasksForProject(project.id, (fetchedTasks) => {
        setTasks(fetchedTasks);
      });
      return () => unsubscribe();
    }
  }, [project.id]);

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tarea</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Prioridad</TableHead>
            <TableHead>Asignado a</TableHead>
            <TableHead>Fecha de Vencimiento</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} className="cursor-pointer">
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>
                <Badge variant="outline" className="flex items-center w-fit gap-2">
                  <span className={`h-2 w-2 rounded-full ${statusColors[task.status]}`} />
                  <span className="capitalize">{statusLabels[task.status]}</span>
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {priorityIcons[task.priority]}
                  <span className="capitalize">{priorityLabels[task.priority]}</span>
                </div>
              </TableCell>
              <TableCell>
                {task.assignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={task.assignee.avatarUrl} alt={task.assignee.name} />
                      <AvatarFallback>{task.assignee.initials}</AvatarFallback>
                    </Avatar>
                    <span>{task.assignee.name}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Sin asignar</span>
                )}
              </TableCell>
              <TableCell>
                {task.dueDate ? format(task.dueDate, 'd MMM, yyyy', { locale: es }) : 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

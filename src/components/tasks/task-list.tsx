import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
} from 'lucide-react';
import type { Task, Project } from '@/lib/types';
import { format } from 'date-fns';

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


export function TaskList({ project }: TaskListProps) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {project.tasks.map((task) => (
            <TableRow key={task.id} className="cursor-pointer">
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>
                <Badge variant="outline" className="flex items-center w-fit gap-2">
                  <span className={`h-2 w-2 rounded-full ${statusColors[task.status]}`} />
                  <span className="capitalize">{task.status.replace('-', ' ')}</span>
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {priorityIcons[task.priority]}
                  <span className="capitalize">{task.priority}</span>
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
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </TableCell>
              <TableCell>
                {task.dueDate ? format(task.dueDate, 'MMM d, yyyy') : 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

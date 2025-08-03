
import { Draggable } from '@hello-pangea/dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { Task } from '@/lib/types';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
} from 'lucide-react';

interface TicketCardProps {
  task: Task;
  index: number;
  onClick: () => void;
}

const priorityIcons: Record<Task['priority'], React.ReactNode> = {
  low: <ArrowDown className="h-4 w-4 text-gray-500" />,
  medium: <ArrowRight className="h-4 w-4 text-yellow-500" />,
  high: <ArrowUp className="h-4 w-4 text-orange-500" />,
  urgent: <ArrowUp className="h-4 w-4 text-red-500" />,
};

const getTaskProgress = (task: Task) => {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    const completed = task.subtasks.filter(st => st.status === 'completed').length;
    return Math.round((completed / task.subtasks.length) * 100);
};

export function TicketCard({ task, index, onClick }: TicketCardProps) {
  const progress = getTaskProgress(task);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-3"
          onClick={onClick}
        >
          <Card
            className={`bg-card rounded-xl hover:bg-muted/80 cursor-pointer transition-shadow duration-300
              ${snapshot.isDragging ? 'ring-2 ring-primary shadow-lg' : 'shadow-md'}`}
          >
            <CardContent className="p-4 space-y-3">
              <span className="font-semibold leading-tight text-base">{task.title}</span>
              
              {task.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
              )}
              
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                 <Badge variant="outline" className="font-normal capitalize flex items-center gap-2">
                    {priorityIcons[task.priority]}
                    {task.priority}
                 </Badge>
                 {task.assignee && (
                    <Avatar className="h-7 w-7">
                        <AvatarImage src={task.assignee.avatarUrl} alt={task.assignee.name} />
                        <AvatarFallback>{task.assignee.initials}</AvatarFallback>
                    </Avatar>
                )}
              </div>

              {task.subtasks && task.subtasks.length > 0 && (
                <div>
                   <div className="flex justify-between items-center mb-1">
                     <span className="text-xs font-medium text-muted-foreground">Progreso</span>
                     <span className="text-xs font-semibold">{progress}%</span>
                   </div>
                   <Progress value={progress} className="h-1.5" />
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}

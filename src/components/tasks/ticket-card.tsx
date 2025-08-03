
import { Draggable } from '@hello-pangea/dnd';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Task } from '@/lib/types';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Circle,
  MoreHorizontal,
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

const tagColors: Record<NonNullable<Task['tags']>[0]['color'], string> = {
  blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  green: 'bg-green-500/20 text-green-300 border-green-500/30',
  orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  red: 'bg-red-500/20 text-red-300 border-red-500/30',
};

export function TicketCard({ task, index, onClick }: TicketCardProps) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-2"
          onClick={onClick}
        >
          <Card
            className={`hover:bg-muted/80 cursor-pointer transition-colors ${
              snapshot.isDragging ? 'ring-2 ring-primary' : ''
            }`}
          >
            <CardContent className="p-3">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium leading-tight">{task.title}</span>
                {/* <MoreHorizontal className="h-4 w-4 text-muted-foreground" /> */}
              </div>
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {task.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline" className={tagColors[tag.color]}>
                      {tag.label}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                  {priorityIcons[task.priority]}
                </div>
                {task.assignee && (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={task.assignee.avatarUrl} alt={task.assignee.name} />
                    <AvatarFallback>{task.assignee.initials}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}

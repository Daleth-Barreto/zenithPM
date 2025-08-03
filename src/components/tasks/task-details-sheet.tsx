import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Calendar as CalendarIcon,
  Tag,
  User,
  Users,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import type { Task, Project } from '@/lib/types';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { format } from 'date-fns';
import { TaskAssigner } from '../ai/task-assigner';

interface TaskDetailsSheetProps {
  task: Task | null;
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskDetailsSheet({ task, project, isOpen, onClose }: TaskDetailsSheetProps) {
  if (!task) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl">{task.title}</SheetTitle>
          <SheetDescription>
            In project <span className="font-semibold text-primary">{project.name}</span>
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto pr-6 -mr-6 pl-1 -ml-1">
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" defaultValue={task.description} rows={5} />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label>
                  <User className="inline-block mr-2 h-4 w-4" />
                  Assignee
                </Label>
                <Select defaultValue={task.assignee?.id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee..." />
                  </SelectTrigger>
                  <SelectContent>
                    {project.team.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={member.avatarUrl} />
                            <AvatarFallback>{member.initials}</AvatarFallback>
                          </Avatar>
                          <span>{member.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>
                  <AlertCircle className="inline-block mr-2 h-4 w-4" />
                  Priority
                </Label>
                <Select defaultValue={task.priority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Set priority..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>
                  <CalendarIcon className="inline-block mr-2 h-4 w-4" />
                  Due Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      {task.dueDate ? format(task.dueDate, 'PPP') : 'Set due date...'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label>
                  <Tag className="inline-block mr-2 h-4 w-4" />
                  Status
                </Label>
                <Select defaultValue={task.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Set status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backlog">Backlog</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2 md:col-span-2">
                <Label>
                  <Users className="inline-block mr-2 h-4 w-4" />
                  Collaborators
                </Label>
                {/* A multi-select component would be ideal here */}
                <div className="flex flex-wrap gap-2">
                  {task.collaborators?.map(c => (
                     <div key={c.id} className="flex items-center gap-2 bg-muted p-1 rounded-md">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={c.avatarUrl} />
                        <AvatarFallback>{c.initials}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Separator />
            <TaskAssigner task={task} project={project} />
          </div>
        </div>
        <SheetFooter className="pt-4 border-t">
          <Button variant="destructive" className="mr-auto">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Task
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>Save Changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

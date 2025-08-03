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
import { es } from 'date-fns/locale';
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
            En el proyecto <span className="font-semibold text-primary">{project.name}</span>
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto pr-6 -mr-6 pl-1 -ml-1">
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" defaultValue={task.description} rows={5} />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label>
                  <User className="inline-block mr-2 h-4 w-4" />
                  Asignado a
                </Label>
                <Select defaultValue={task.assignee?.id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar asignado..." />
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
                  Prioridad
                </Label>
                <Select defaultValue={task.priority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Establecer prioridad..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>
                  <CalendarIcon className="inline-block mr-2 h-4 w-4" />
                  Fecha de Vencimiento
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      {task.dueDate ? format(task.dueDate, 'PPP', { locale: es }) : 'Establecer fecha...'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" locale={es}/>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label>
                  <Tag className="inline-block mr-2 h-4 w-4" />
                  Estado
                </Label>
                <Select defaultValue={task.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Establecer estado..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backlog">Pendiente</SelectItem>
                    <SelectItem value="in-progress">En Progreso</SelectItem>
                    <SelectItem value="review">En Revisión</SelectItem>
                    <SelectItem value="done">Hecho</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2 md:col-span-2">
                <Label>
                  <Users className="inline-block mr-2 h-4 w-4" />
                  Colaboradores
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
            Eliminar Tarea
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onClose}>Guardar Cambios</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

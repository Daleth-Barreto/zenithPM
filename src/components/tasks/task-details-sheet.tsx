
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Calendar as CalendarIcon,
  Tag,
  User,
  Users,
  AlertCircle,
  Trash2,
  Loader2,
  Plus,
  Send,
  MessageSquare,
  Edit,
} from 'lucide-react';
import type { Task, Project, TaskPriority, TaskStatus, Subtask, SubtaskStatus } from '@/lib/types';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { TaskAssigner } from '../ai/task-assigner';
import { useEffect, useState, useRef, useCallback } from 'react';
import { deleteTask, updateTask, addCommentToTask } from '@/lib/firebase-services';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { Badge } from '../ui/badge';


interface TaskDetailsSheetProps {
  task: Task | null;
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (task: Task) => void;
}

const priorityMap: Record<TaskPriority, string> = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    urgent: 'Urgente'
}

const statusMap: Record<TaskStatus, string> = {
    backlog: 'Pendiente',
    'in-progress': 'En Progreso',
    review: 'En Revisión',
    done: 'Hecho'
}

export function TaskDetailsSheet({ task, project, isOpen, onClose, onUpdate }: TaskDetailsSheetProps) {
  const [currentTask, setCurrentTask] = useState<Task | null>(task);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  const debouncedSaveRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Reset editing state when a new task is passed in
    if (task) {
      setCurrentTask(task);
      setIsEditing(false);
    }
  }, [task]);

  const saveTask = useCallback(async (taskToSave: Task) => {
    const { id, ...taskData } = taskToSave;
    await updateTask(project.id, id, taskData);
  }, [project.id]);
  
  const handleDebouncedSave = useCallback((updatedTask: Task) => {
    if (debouncedSaveRef.current) {
      clearTimeout(debouncedSaveRef.current);
    }
    debouncedSaveRef.current = setTimeout(() => saveTask(updatedTask), 1000);
  }, [saveTask]);


  if (!currentTask) return null;

  const handleFieldChange = (field: keyof Task, value: any) => {
    const updatedTask = { ...currentTask, [field]: value };
    setCurrentTask(updatedTask);
    onUpdate(updatedTask); // Immediately update parent state for reactivity
    handleDebouncedSave(updatedTask);
  }

  const handleAssigneeChange = (memberId: string) => {
    const assignee = project.team.find(m => m.id === memberId);
    handleFieldChange('assignee', assignee || null);
  }
  
  const handleSubtaskStatusChange = (subtaskId: string, status: SubtaskStatus) => {
    const updatedSubtasks = currentTask.subtasks?.map(st =>
      st.id === subtaskId ? { ...st, status } : st
    );
    handleFieldChange('subtasks', updatedSubtasks);
  };
  
  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim() || !currentTask) return;
    const newSubtask: Subtask = {
      id: new Date().getTime().toString(),
      title: newSubtaskTitle,
      status: 'pending',
    };
    const updatedSubtasks = [...(currentTask.subtasks || []), newSubtask];
    handleFieldChange('subtasks', updatedSubtasks);
    setNewSubtaskTitle('');
  };
  
  const handleDeleteSubtask = (subtaskId: string) => {
    const updatedSubtasks = currentTask.subtasks?.filter(st => st.id !== subtaskId);
    handleFieldChange('subtasks', updatedSubtasks);
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentTask || !user) return;
    const commentData = {
        text: newComment,
        authorId: user.uid,
        authorName: user.displayName || 'Usuario',
        authorAvatarUrl: user.photoURL || undefined,
    };
    await addCommentToTask(project.id, currentTask.id, commentData);
    setNewComment('');
  }

  const handleSaveAndClose = async () => {
    if (!currentTask) return;
    if (debouncedSaveRef.current) {
      clearTimeout(debouncedSaveRef.current);
    }
    setIsSaving(true);
    try {
        await saveTask(currentTask);
        onUpdate(currentTask); 
        setIsEditing(false); // Go back to view mode
        toast({
            title: 'Tarea Actualizada',
            description: `Se han guardado los cambios para "${currentTask.title}".`
        })
    } catch (error) {
        console.error("Error saving task:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'No se pudieron guardar los cambios.'
        })
    } finally {
        setIsSaving(false);
    }
  }

  const handleDelete = async () => {
    if(!currentTask) return;
    setIsDeleting(true);
     try {
        await deleteTask(project.id, currentTask.id);
        toast({
            title: 'Tarea Eliminada',
            description: `Se ha eliminado la tarea "${currentTask.title}".`
        });
        onClose();
    } catch (error) {
        console.error("Error deleting task:", error);
         toast({
            variant: 'destructive',
            title: 'Error',
            description: 'No se pudo eliminar la tarea.'
        })
    } finally {
        setIsDeleting(false);
    }
  }
  
  const handleCancelEdit = () => {
      setCurrentTask(task); // Revert changes to original task state
      setIsEditing(false);
  }
  
  const renderViewMode = () => (
      <>
        <div className="flex-1 overflow-y-auto pr-6 -mr-6 pl-1 -ml-1">
            <div className="space-y-6 py-4">
                {currentTask.description ? (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{currentTask.description}</p>
                ) : (
                    <p className="text-sm text-muted-foreground italic">No hay descripción para esta tarea.</p>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Asignado a:</span>
                        {currentTask.assignee ? (
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={currentTask.assignee.avatarUrl} />
                                    <AvatarFallback>{currentTask.assignee.initials}</AvatarFallback>
                                </Avatar>
                                <span>{currentTask.assignee.name}</span>
                            </div>
                        ) : <span className="text-muted-foreground italic">Sin asignar</span>}
                    </div>

                     <div className="flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Prioridad:</span>
                        <Badge variant="outline">{priorityMap[currentTask.priority]}</Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Estado:</span>
                        <span>{statusMap[currentTask.status]}</span>
                    </div>

                     <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Fecha Límite:</span>
                        <span>{currentTask.dueDate ? format(new Date(currentTask.dueDate), 'PPP', { locale: es }) : <span className="text-muted-foreground italic">No definida</span>}</span>
                    </div>
                </div>

                {currentTask.subtasks && currentTask.subtasks.length > 0 && (
                     <>
                        <Separator />
                        <div className="space-y-3">
                            <Label>Subtareas</Label>
                             {currentTask.subtasks.map(subtask => (
                                <div key={subtask.id} className="flex items-center gap-3">
                                <Checkbox
                                    id={`subtask-view-${subtask.id}`}
                                    checked={subtask.status === 'completed'}
                                    disabled
                                />
                                <label
                                    htmlFor={`subtask-view-${subtask.id}`}
                                    className={cn(
                                    "text-sm font-medium leading-none flex-1",
                                    subtask.status === 'completed' && "line-through text-muted-foreground"
                                    )}
                                >
                                    {subtask.title}
                                </label>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                
                <Separator />
            
                <div className="space-y-4">
                  <Label>
                    <MessageSquare className="inline-block mr-2 h-4 w-4" />
                    Comentarios
                  </Label>
                  <div className="space-y-4">
                    {[...(currentTask.comments || [])].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(comment => (
                        <div key={comment.id} className="flex gap-3">
                        <Avatar>
                            <AvatarImage src={comment.authorAvatarUrl} />
                            <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="p-3 rounded-lg bg-muted flex-1">
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-semibold">{comment.authorName}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: es })}
                                </p>
                            </div>
                            <p className="text-sm mt-1 whitespace-pre-wrap">{comment.text}</p>
                        </div>
                        </div>
                    ))}

                     {(!currentTask.comments || currentTask.comments.length === 0) && (
                        <p className="text-sm text-muted-foreground text-center py-4">No hay comentarios todavía.</p>
                    )}
                  </div>
                  <div className="flex gap-2 items-center">
                     <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.photoURL || undefined} />
                        <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <Textarea 
                        placeholder="Escribe un comentario..." 
                        value={newComment} 
                        onChange={e => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAddComment();
                            }
                        }}
                        rows={1}
                    />
                    <Button size="icon" onClick={handleAddComment} disabled={!newComment.trim()}><Send className="h-4 w-4" /></Button>
                  </div>
                </div>

            </div>
        </div>
        <SheetFooter className="pt-4 border-t">
            <Button variant="outline" className="w-full" onClick={onClose}>Cerrar</Button>
        </SheetFooter>
      </>
  )

  const renderEditMode = () => (
       <>
        <div className="flex-1 overflow-y-auto pr-6 -mr-6 pl-1 -ml-1">
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea 
                id="description" 
                value={currentTask.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)} 
                rows={5} 
                placeholder="Añade una descripción más detallada..."
              />
            </div>

            <Separator />

            <div className="space-y-4">
                <Label>Subtareas</Label>
                <div className="space-y-2">
                    {currentTask.subtasks?.map(subtask => (
                        <div key={subtask.id} className="flex items-center gap-3 group">
                        <Checkbox
                            id={`subtask-sheet-${subtask.id}`}
                            checked={subtask.status === 'completed'}
                            onCheckedChange={(checked) => handleSubtaskStatusChange(subtask.id, checked ? 'completed' : 'pending')}
                        />
                        <label
                            htmlFor={`subtask-sheet-${subtask.id}`}
                            className={cn(
                            "text-sm font-medium leading-none flex-1",
                            subtask.status === 'completed' && "line-through text-muted-foreground"
                            )}
                        >
                            {subtask.title}
                        </label>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteSubtask(subtask.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <Input 
                        placeholder="Añadir subtarea..."
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                    />
                    <Button size="icon" onClick={handleAddSubtask} disabled={!newSubtaskTitle.trim()}><Plus className="h-4 w-4"/></Button>
                </div>
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label>
                  <User className="inline-block mr-2 h-4 w-4" />
                  Asignado a
                </Label>
                <Select value={currentTask.assignee?.id} onValueChange={handleAssigneeChange}>
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
                <Select value={currentTask.priority} onValueChange={(v: TaskPriority) => handleFieldChange('priority', v)}>
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
                      {currentTask.dueDate ? format(new Date(currentTask.dueDate), 'PPP', { locale: es }) : 'Establecer fecha...'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar 
                      mode="single" 
                      locale={es}
                      selected={currentTask.dueDate ? new Date(currentTask.dueDate) : undefined}
                      onSelect={(date) => handleFieldChange('dueDate', date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label>
                  <Tag className="inline-block mr-2 h-4 w-4" />
                  Estado
                </Label>
                <Select value={currentTask.status} onValueChange={(v: TaskStatus) => handleFieldChange('status', v)}>
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
                <div className="flex flex-wrap gap-2">
                  {currentTask.collaborators?.map(c => (
                     <div key={c.id} className="flex items-center gap-2 bg-muted p-1 rounded-md">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={c.avatarUrl} />
                        <AvatarFallback>{c.initials}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{c.name}</span>
                    </div>
                  ))}
                   <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted border border-dashed hover:bg-border cursor-pointer">
                        <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
              </div>
            </div>
            
            <Separator />
            <TaskAssigner task={currentTask} project={project} />
          </div>
        </div>
        <SheetFooter className="pt-4 border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
               <Button variant="destructive" className="mr-auto" disabled={isDeleting}>
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Eliminar Tarea
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro de que quieres eliminar esta tarea?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Esto eliminará permanentemente la tarea de tu proyecto.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sí, eliminar tarea" }
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
         
          <Button variant="outline" onClick={handleCancelEdit}>
            Cancelar
          </Button>
          <Button onClick={handleSaveAndClose} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
          </Button>
        </SheetFooter>
      </>
  )

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl flex flex-col">
        <SheetHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
                {isEditing ? (
                    <Input 
                        value={currentTask.title} 
                        onChange={(e) => handleFieldChange('title', e.target.value)}
                        className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 p-0"
                    />
                ) : (
                    <SheetTitle className="text-2xl">{currentTask.title}</SheetTitle>
                )}
                <SheetDescription>
                    En el proyecto <span className="font-semibold text-primary">{project.name}</span>
                </SheetDescription>
            </div>
            {!isEditing && (
                 <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4"/>
                    Editar
                </Button>
            )}
          </div>
        </SheetHeader>
        
        {isEditing ? renderEditMode() : renderViewMode()}

      </SheetContent>
    </Sheet>
  );
}

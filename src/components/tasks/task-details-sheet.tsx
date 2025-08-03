
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
  SelectGroup,
  SelectLabel
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Calendar as CalendarIcon,
  Tag,
  User,
  AlertCircle,
  Trash2,
  Loader2,
  Plus,
  Send,
  MessageSquare,
  Edit,
  MoreHorizontal,
} from 'lucide-react';
import type { Task, Project, TaskPriority, TaskStatus, Subtask, SubtaskStatus, Comment } from '@/lib/types';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { TaskAssigner } from '../ai/task-assigner';
import { useEffect, useState } from 'react';
import { deleteTask, updateTask, addCommentToTask, updateCommentInTask, deleteCommentFromTask, createNotification } from '@/lib/firebase-services';
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
import { doc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';


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

export function TaskDetailsSheet({ task: initialTask, project, isOpen, onClose, onUpdate }: TaskDetailsSheetProps) {
  const [task, setTask] = useState(initialTask);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  const { toast } = useToast();
  const { user } = useAuth();
  
  // No canEdit state, all can edit
  const isEditing = true;

  useEffect(() => {
    setTask(initialTask);
  }, [initialTask]);


  if (!task) return null;

  const handleFieldChange = (field: keyof Task, value: any) => {
    if (!task) return;
    const updatedTask = { ...task, [field]: value };
    setTask(updatedTask);
  }

  const handleAssigneeChange = (value: string) => {
    const assignee = project.team.find(m => m.id === value);
    handleFieldChange('assignee', assignee || null);
  }
  
  const handleSubtaskStatusChange = async (subtaskId: string, status: SubtaskStatus) => {
    if (!task) return;

    const updatedSubtasks = task.subtasks?.map(st =>
      st.id === subtaskId ? { ...st, status } : st
    );

    const updatedTask = { ...task, subtasks: updatedSubtasks };
    setTask(updatedTask); // Optimistic update
    await updateTask(project.id, task.id, { subtasks: updatedSubtasks });
    
    if (status === 'completed' && user && task.assignee && task.assignee.id !== user.uid) {
        createNotification({
            userId: task.assignee.id,
            message: `${user.displayName} completó una subtarea en: "${task.title}"`,
            link: `/projects/${project.id}/board`,
        })
    }
  };
  
  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim() || !task) return;
    const newSubtask: Subtask = {
      id: doc(collection(db, 'dummy')).id,
      title: newSubtaskTitle,
      status: 'pending',
    };
    const updatedSubtasks = [...(task.subtasks || []), newSubtask];
    handleFieldChange('subtasks', updatedSubtasks);
    setNewSubtaskTitle('');
  };
  
  const handleDeleteSubtask = (subtaskId: string) => {
    if (!task) return;
    const updatedSubtasks = task.subtasks?.filter(st => st.id !== subtaskId);
    handleFieldChange('subtasks', updatedSubtasks);
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !task || !user) return;
    
    await addCommentToTask(project.id, task.id, newComment, user);
    setNewComment('');
  }

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.text);
  }

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  }

  const handleUpdateComment = async () => {
    if (!editingCommentId || !task) return;
    try {
        await updateCommentInTask(project.id, task.id, editingCommentId, editingCommentText);
        handleCancelEditComment();
        toast({ title: "Comentario actualizado" });
    } catch (error) {
        console.error("Error updating comment:", error);
        toast({ variant: 'destructive', title: "Error", description: "No se pudo actualizar el comentario." });
    }
  }

  const handleDeleteComment = async (commentId: string) => {
      if (!task) return;
      try {
        await deleteCommentFromTask(project.id, task.id, commentId);
        toast({ title: "Comentario eliminado" });
      } catch (error) {
        console.error("Error deleting comment:", error);
        toast({ variant: 'destructive', title: "Error", description: "No se pudo eliminar el comentario." });
      }
  }

  const handleSaveAndClose = async () => {
    if (!task) return;
    setIsSaving(true);
    try {
        const { id, ...taskData } = task;
        await updateTask(project.id, id, taskData);
        onUpdate(task); 
        toast({
            title: 'Tarea Actualizada',
            description: `Se han guardado los cambios para "${task.title}".`
        })
        onClose();
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
    if(!task) return;
    setIsDeleting(true);
     try {
        await deleteTask(project.id, task.id);
        toast({
            title: 'Tarea Eliminada',
            description: `Se ha eliminado la tarea "${task.title}".`
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
  
  const handleCancel = () => {
      setTask(initialTask); // Revert changes
      onClose();
  }

  const sortedComments = [...(task?.comments || [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl flex flex-col">
        <SheetHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-10">
                <Input
                    id="title"
                    value={task?.title || ''}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    className="text-2xl font-semibold border-none -ml-3 focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Título de la tarea"
                />
                <SheetDescription>
                    En el proyecto <span className="font-semibold text-primary">{project.name}</span>
                </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto pr-6 -mr-6 pl-1 -ml-1">
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea 
                id="description" 
                value={task?.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)} 
                rows={5} 
                placeholder="Añade una descripción más detallada..."
              />
            </div>

            <Separator />

            <div className="space-y-4">
                <Label>Subtareas</Label>
                <div className="space-y-2">
                    {task?.subtasks?.map(subtask => (
                        <div key={subtask.id} className="flex items-center gap-3 group">
                        <Checkbox
                            id={`subtask-sheet-${subtask.id}`}
                            checked={subtask.status === 'completed'}
                            onCheckedChange={(checked) => handleSubtaskStatusChange(subtask.id, checked ? 'completed' : 'pending')}
                        />
                        <Input
                            value={subtask.title}
                            onChange={(e) => {
                                const newTitle = e.target.value;
                                const updatedSubtasks = task.subtasks?.map(st => st.id === subtask.id ? {...st, title: newTitle} : st);
                                handleFieldChange('subtasks', updatedSubtasks);
                            }}
                            className={cn(
                                "text-sm font-medium leading-none flex-1 border-none h-auto p-0 focus-visible:ring-0",
                                subtask.status === 'completed' && "line-through text-muted-foreground"
                            )}
                        />
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
                <Select value={task?.assignee?.id} onValueChange={handleAssigneeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar asignado..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Miembros</SelectLabel>
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
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>
                  <AlertCircle className="inline-block mr-2 h-4 w-4" />
                  Prioridad
                </Label>
                <Select value={task?.priority} onValueChange={(v: TaskPriority) => handleFieldChange('priority', v)}>
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
                      {task?.dueDate ? format(new Date(task.dueDate), 'PPP', { locale: es }) : 'Establecer fecha...'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar 
                      mode="single" 
                      locale={es}
                      selected={task?.dueDate ? new Date(task.dueDate) : undefined}
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
                <Select value={task?.status} onValueChange={(v: TaskStatus) => handleFieldChange('status', v)}>
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
            </div>
            
            <Separator />
            <TaskAssigner task={task!} project={project} />

            <Separator />
            <div className="space-y-4">
              <Label>
                <MessageSquare className="inline-block mr-2 h-4 w-4" />
                Comentarios
              </Label>
              <div className="space-y-4">
                {sortedComments.map(comment => (
                    <div key={comment.id} className="flex gap-3 group">
                    <Avatar>
                        <AvatarImage src={comment.authorAvatarUrl} />
                        <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="p-3 rounded-lg bg-muted flex-1">
                        <div className="flex justify-between items-center">
                            <p className="text-sm font-semibold">{comment.authorName}</p>
                            <div className="flex items-center">
                                <p className="text-xs text-muted-foreground mr-2">
                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: es })}
                                </p>
                                {user?.uid === comment.authorId && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEditComment(comment)}>Editar</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteComment(comment.id)}>Eliminar</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>
                        {editingCommentId === comment.id ? (
                            <div className="mt-2">
                                <Textarea value={editingCommentText} onChange={e => setEditingCommentText(e.target.value)} className="mb-2" />
                                <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="ghost" onClick={handleCancelEditComment}>Cancelar</Button>
                                    <Button size="sm" onClick={handleUpdateComment}>Guardar</Button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm mt-1 whitespace-pre-wrap">{comment.text}</p>
                        )}
                    </div>
                    </div>
                ))}

                  {(!task?.comments || task.comments.length === 0) && (
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
         
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSaveAndClose} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar y Cerrar
          </Button>
        </SheetFooter>

      </SheetContent>
    </Sheet>
  );
}

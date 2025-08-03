
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
  Users,
  AlertCircle,
  Trash2,
  Loader2,
  Plus,
  Send,
  MessageSquare,
  Edit,
  MoreHorizontal,
} from 'lucide-react';
import type { Task, Project, TaskPriority, TaskStatus, Subtask, SubtaskStatus, Team, Comment } from '@/lib/types';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { TaskAssigner } from '../ai/task-assigner';
import { useEffect, useState, useRef, useCallback } from 'react';
import { deleteTask, updateTask, addCommentToTask, getTeamById, updateCommentInTask, deleteCommentFromTask } from '@/lib/firebase-services';
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

export function TaskDetailsSheet({ task: initialTask, project, isOpen, onClose, onUpdate }: TaskDetailsSheetProps) {
  const [task, setTask] = useState(initialTask);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [associatedTeams, setAssociatedTeams] = useState<Team[]>([]);
  const [assignedTeam, setAssignedTeam] = useState<Team | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  const { toast } = useToast();
  const { user } = useAuth();
  
  const canEdit = user && project.team.find(m => m.id === user.uid)?.role === 'Admin';

  useEffect(() => {
    setTask(initialTask);
  }, [initialTask]);

  useEffect(() => {
    if (task && task.assignedTeamId) {
      getTeamById(task.assignedTeamId).then(setAssignedTeam);
    } else {
      setAssignedTeam(null);
    }
  }, [task]);

  useEffect(() => {
    if (project.associatedTeamIds && project.associatedTeamIds.length > 0) {
      Promise.all(project.associatedTeamIds.map(id => getTeamById(id)))
        .then(teams => {
          setAssociatedTeams(teams.filter((t): t is Team => t !== null));
        });
    } else {
      setAssociatedTeams([]);
    }
  }, [project.associatedTeamIds]);


  if (!task) return null;

  const handleFieldChange = (field: keyof Task, value: any) => {
    if (!isEditing || !task) return;
    const updatedTask = { ...task, [field]: value };
    setTask(updatedTask);
  }

  const handleAssigneeChange = (value: string) => {
    if (!isEditing) return;
    if (value.startsWith('user-')) {
        const memberId = value.replace('user-', '');
        const assignee = project.team.find(m => m.id === memberId);
        handleFieldChange('assignee', assignee || null);
        handleFieldChange('assignedTeamId', null);
    } else if (value.startsWith('team-')) {
        const teamId = value.replace('team-', '');
        handleFieldChange('assignedTeamId', teamId);
        handleFieldChange('assignee', null);
    } else {
        handleFieldChange('assignee', null);
        handleFieldChange('assignedTeamId', null);
    }
  }
  
  const handleSubtaskStatusChange = (subtaskId: string, status: SubtaskStatus) => {
    if (!isEditing || !task) return;
    const updatedSubtasks = task.subtasks?.map(st =>
      st.id === subtaskId ? { ...st, status } : st
    );
    handleFieldChange('subtasks', updatedSubtasks);
  };
  
  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim() || !isEditing || !task) return;
    const newSubtask: Subtask = {
      id: new Date().getTime().toString(),
      title: newSubtaskTitle,
      status: 'pending',
    };
    const updatedSubtasks = [...(task.subtasks || []), newSubtask];
    handleFieldChange('subtasks', updatedSubtasks);
    setNewSubtaskTitle('');
  };
  
  const handleDeleteSubtask = (subtaskId: string) => {
    if (!isEditing || !task) return;
    const updatedSubtasks = task.subtasks?.filter(st => st.id !== subtaskId);
    handleFieldChange('subtasks', updatedSubtasks);
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !task || !user) return;
    
    const commentData: Omit<Comment, 'id' | 'createdAt'> = {
        text: newComment,
        authorId: user.uid,
        authorName: user.displayName || 'Usuario',
        authorAvatarUrl: user.photoURL || undefined,
    };
    
    if (commentData.authorAvatarUrl === undefined) {
      delete commentData.authorAvatarUrl;
    }

    await addCommentToTask(project.id, task.id, commentData);
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

  const handleStartEditing = () => {
    setIsEditing(true);
  }

  const handleSaveAndClose = async () => {
    if (!task || !canEdit) return;
    setIsSaving(true);
    try {
        const { id, ...taskData } = task;
        await updateTask(project.id, id, taskData);
        onUpdate(task); 
        setIsEditing(false);
        toast({
            title: 'Tarea Actualizada',
            description: `Se han guardado los cambios para "${task.title}".`
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
    if(!task || !canEdit) return;
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
  
  const handleCancelEdit = () => {
      setTask(initialTask); // Revert changes
      setIsEditing(false);
  }

  const sortedComments = [...(task?.comments || [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  
  const renderViewMode = () => (
      <>
        <div className="flex-1 overflow-y-auto pr-6 -mr-6 pl-1 -ml-1">
            <div className="space-y-6 py-4">
                {task?.description ? (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.description}</p>
                ) : (
                    <p className="text-sm text-muted-foreground italic">No hay descripción para esta tarea.</p>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Asignado a:</span>
                        {task?.assignee ? (
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={task.assignee.avatarUrl} />
                                    <AvatarFallback>{task.assignee.initials}</AvatarFallback>
                                </Avatar>
                                <span>{task.assignee.name}</span>
                            </div>
                        ) : assignedTeam ? (
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarFallback><Users className="h-4 w-4"/></AvatarFallback>
                                </Avatar>
                                <span>{assignedTeam.name}</span>
                            </div>
                        ) : <span className="text-muted-foreground italic">Sin asignar</span>}
                    </div>

                     <div className="flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Prioridad:</span>
                        <Badge variant="outline" className="capitalize">{task?.priority}</Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Estado:</span>
                        <span>{task && statusMap[task.status]}</span>
                    </div>

                     <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Fecha Límite:</span>
                        <span>{task?.dueDate ? format(new Date(task.dueDate), 'PPP', { locale: es }) : <span className="text-muted-foreground italic">No definida</span>}</span>
                    </div>
                </div>

                {task?.subtasks && task.subtasks.length > 0 && (
                     <>
                        <Separator />
                        <div className="space-y-3">
                            <Label>Subtareas</Label>
                             {task.subtasks.map(subtask => (
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
            <Button variant="outline" className="w-full" onClick={onClose}>Cerrar</Button>
        </SheetFooter>
      </>
  )

  const renderEditMode = () => (
       <>
        <div className="flex-1 overflow-y-auto pr-6 -mr-6 pl-1 -ml-1">
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
                <Label htmlFor="title">Título de la Tarea</Label>
                <Input 
                    id="title"
                    value={task?.title || ''} 
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    className="text-lg font-semibold"
                />
            </div>
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
                <Select value={task?.assignee ? `user-${task.assignee.id}` : task?.assignedTeamId ? `team-${task.assignedTeamId}` : ''} onValueChange={handleAssigneeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar asignado..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                       <SelectLabel>Equipos</SelectLabel>
                        {associatedTeams.map((team) => (
                           <SelectItem key={team.id} value={`team-${team.id}`}>
                                <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarFallback><Users className="h-4 w-4"/></AvatarFallback>
                                </Avatar>
                                <span>{team.name}</span>
                                </div>
                           </SelectItem>
                        ))}
                    </SelectGroup>
                    <SelectGroup>
                        <SelectLabel>Miembros</SelectLabel>
                        {project.team.map((member) => (
                        <SelectItem key={member.id} value={`user-${member.id}`}>
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

              <div className="grid gap-2 md:col-span-2">
                <Label>
                  <Users className="inline-block mr-2 h-4 w-4" />
                  Colaboradores
                </Label>
                <div className="flex flex-wrap gap-2">
                  {task?.collaborators?.map(c => (
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
            <TaskAssigner task={task!} project={project} />
          </div>
        </div>
        <SheetFooter className="pt-4 border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
               <Button variant="destructive" className="mr-auto" disabled={isDeleting || !canEdit}>
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
          <Button onClick={handleSaveAndClose} disabled={isSaving || !canEdit}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
          </Button>
        </SheetFooter>
      </>
  )

  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setIsEditing(false); // Reset edit mode on close
        onClose();
      } else {
        onClose(); // Should not be called, but for safety
      }
    }}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl flex flex-col">
        <SheetHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
                 <SheetTitle className="text-2xl pr-10">{task?.title}</SheetTitle>
                <SheetDescription>
                    En el proyecto <span className="font-semibold text-primary">{project.name}</span>
                </SheetDescription>
            </div>
            {!isEditing && canEdit && (
                 <Button variant="outline" size="sm" onClick={handleStartEditing}>
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


'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Plus,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  MessageSquare,
  Paperclip,
  Trash2,
  Edit,
  Eye,
} from 'lucide-react';
import type { Task, Project, Subtask, SubtaskStatus } from '@/lib/types';
import { getTasksForProject, createTask, updateTask, deleteTask } from '@/lib/firebase-services';
import { cn } from '@/lib/utils';
import { TaskDetailsSheet } from './task-details-sheet';
import { useToast } from '@/hooks/use-toast';

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
  backlog: 'bg-gray-400',
  'in-progress': 'bg-blue-500',
  review: 'bg-purple-500',
  done: 'bg-green-500',
};

export function TaskList({ project }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (project.id) {
      const unsubscribe = getTasksForProject(project.id, (fetchedTasks) => {
        setTasks(fetchedTasks);
      });
      return () => unsubscribe();
    }
  }, [project.id]);

  const handleCreateTask = async () => {
    const newTaskData = {
      title: 'Nueva Tarea - haz clic para editar',
      status: 'backlog' as const,
      priority: 'medium' as const,
      description: '',
      subtasks: [],
      order: tasks.length,
    };
    await createTask(project.id, newTaskData);
    toast({
        title: 'Tarea Creada',
        description: 'Se ha añadido una nueva tarea a tu lista.'
    })
  };

  const handleSubtaskStatusChange = (taskId: string, subtaskId: string, status: SubtaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks?.map(st => 
      st.id === subtaskId ? { ...st, status } : st
    ) || [];

    updateTask(project.id, taskId, { subtasks: updatedSubtasks });
  };
  
  const handleAddSubtask = (taskId: string, title: string) => {
    if (!title.trim()) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newSubtask: Subtask = {
      id: new Date().getTime().toString(), // Simple unique ID
      title: title,
      status: 'pending',
    };

    const updatedSubtasks = [...(task.subtasks || []), newSubtask];
    updateTask(project.id, taskId, { subtasks: updatedSubtasks });
  };
  
  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(project.id, taskId);
    toast({
      title: 'Tarea Eliminada',
      description: 'La tarea ha sido eliminada permanentemente.'
    });
  }

  const getTaskProgress = (task: Task) => {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    const completed = task.subtasks.filter(st => st.status === 'completed').length;
    return Math.round((completed / task.subtasks.length) * 100);
  };

  return (
    <>
        <Card>
        <CardContent className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Lista de Tareas</h2>
            <Button onClick={handleCreateTask}>
                <Plus className="mr-2 h-4 w-4" /> Nueva Tarea
            </Button>
            </div>
            <div className="w-full space-y-2">
            {tasks.map((task) => (
                <div key={task.id} className="border rounded-lg bg-card transition-all hover:shadow-md">
                <div className="flex items-center gap-4 p-4">
                    <span className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", statusColors[task.status])} />
                    <div className='flex-1 text-left'>
                        <p className="font-medium text-base">{task.title}</p>
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                            <Badge variant="outline" className="font-normal">
                            {priorityIcons[task.priority]} {task.priority}
                            </Badge>
                            {task.assignee && (
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={task.assignee.avatarUrl} />
                                <AvatarFallback>{task.assignee.initials}</AvatarFallback>
                            </Avatar>
                            )}
                            <div className="flex items-center gap-1 text-muted-foreground text-sm">
                            <MessageSquare className="w-4 h-4" /> {task.comments?.length || 0}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground text-sm">
                            <Paperclip className="w-4 h-4" /> 0
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground text-sm w-32">
                            <Progress value={getTaskProgress(task)} className="h-2" />
                            <span>{getTaskProgress(task)}%</span>
                            </div>
                        </div>
                    </div>
                     <Button variant="ghost" size="icon" onClick={() => setSelectedTask(task)}>
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteTask(task.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                </div>
            ))}
            </div>
        </CardContent>
        </Card>
        <TaskDetailsSheet
            task={selectedTask}
            project={project}
            isOpen={!!selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={(updatedTask) => {
                setSelectedTask(updatedTask);
            }}
        />
    </>
  );
}

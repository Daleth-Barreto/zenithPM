
'use client';

import { useState, useEffect, type ChangeEvent } from 'react';
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
} from 'lucide-react';
import type { Task, Project, Subtask, SubtaskStatus } from '@/lib/types';
import { getTasksForProject, createTask, updateTask } from '@/lib/firebase-services';
import { cn } from '@/lib/utils';

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
  };

  const handleSubtaskStatusChange = (taskId: string, subtaskId: string, status: SubtaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks?.map(st => 
      st.id === subtaskId ? { ...st, status } : st
    ) || [];

    updateTask(project.id, taskId, { subtasks: updatedSubtasks });
  };
  
  const handleAddSubtask = (taskId: string) => {
    if (!newSubtaskTitle.trim()) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newSubtask: Subtask = {
      id: new Date().getTime().toString(), // Simple unique ID
      title: newSubtaskTitle,
      status: 'pending',
    };

    const updatedSubtasks = [...(task.subtasks || []), newSubtask];
    updateTask(project.id, taskId, { subtasks: updatedSubtasks });
    setNewSubtaskTitle('');
  };
  
  const handleTaskTitleChange = (taskId: string, newTitle: string) => {
    updateTask(project.id, taskId, { title: newTitle });
  }

  const getTaskProgress = (task: Task) => {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    const completed = task.subtasks.filter(st => st.status === 'completed').length;
    return Math.round((completed / task.subtasks.length) * 100);
  };


  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Lista de Tareas</h2>
          <Button onClick={handleCreateTask}>
            <Plus className="mr-2 h-4 w-4" /> Nueva Tarea
          </Button>
        </div>
        <Accordion type="single" collapsible className="w-full space-y-2">
          {tasks.map((task) => (
            <AccordionItem value={task.id} key={task.id} className="border rounded-lg bg-card">
              <AccordionTrigger className="p-4 hover:no-underline">
                <div className="flex items-center gap-4 w-full">
                  <span className={cn("w-2.5 h-2.5 rounded-full", statusColors[task.status])} />
                  <div className='flex-1 text-left'>
                    <p className="font-medium text-base">{task.title}</p>
                     <div className="flex items-center gap-4 mt-2">
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
                          <MessageSquare className="w-4 h-4" /> 0
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
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 border-t">
                <div className="space-y-3 pl-8">
                  {task.subtasks?.map(subtask => (
                    <div key={subtask.id} className="flex items-center gap-3">
                      <Checkbox
                        id={`subtask-${subtask.id}`}
                        checked={subtask.status === 'completed'}
                        onCheckedChange={(checked) => handleSubtaskStatusChange(task.id, subtask.id, checked ? 'completed' : 'pending')}
                      />
                      <label
                        htmlFor={`subtask-${subtask.id}`}
                        className={cn(
                          "text-sm font-medium leading-none",
                          subtask.status === 'completed' && "line-through text-muted-foreground"
                        )}
                      >
                        {subtask.title}
                      </label>
                    </div>
                  ))}
                </div>
                 <div className="flex items-center gap-2 mt-4 pl-8">
                    <Input 
                      placeholder="Añadir una nueva subtarea..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask(task.id)}
                    />
                    <Button onClick={() => handleAddSubtask(task.id)}>Añadir</Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

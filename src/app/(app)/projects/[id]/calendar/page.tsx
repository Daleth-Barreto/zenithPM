
'use client';

import { useProject } from '../layout';
import { getTasksForProject } from '@/lib/firebase-services';
import { useEffect, useState, useMemo } from 'react';
import type { Task, TaskPriority } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const priorityColors: Record<TaskPriority, string> = {
    urgent: 'hsl(var(--destructive))',
    high: 'hsl(var(--chart-4))',
    medium: 'hsl(var(--chart-1))',
    low: 'hsl(var(--muted))',
}

const priorityOrder: TaskPriority[] = ['urgent', 'high', 'medium', 'low'];

export default function ProjectCalendarPage() {
  const project = useProject();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (project) {
      const unsubscribe = getTasksForProject(project.id, (fetchedTasks) => {
        setTasks(fetchedTasks);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [project]);

  const tasksWithDueDate = tasks.filter(task => task.dueDate);
  
  const { modifiers, modifiersStyles } = useMemo(() => {
    const tasksByDay: Record<string, Task[]> = {};
    tasksWithDueDate.forEach(task => {
        const day = format(new Date(task.dueDate!), 'yyyy-MM-dd');
        if (!tasksByDay[day]) {
            tasksByDay[day] = [];
        }
        tasksByDay[day].push(task);
    });

    const modifiers: Record<TaskPriority, Date[]> = {
        urgent: [],
        high: [],
        medium: [],
        low: [],
    };

    Object.entries(tasksByDay).forEach(([day, dayTasks]) => {
        let highestPriority: TaskPriority | null = null;
        for (const priority of priorityOrder) {
            if (dayTasks.some(t => t.priority === priority)) {
                highestPriority = priority;
                break;
            }
        }
        if (highestPriority) {
            modifiers[highestPriority].push(new Date(day));
        }
    });
    
    const modifiersStyles = {
        urgent: { backgroundColor: priorityColors.urgent, color: 'hsl(var(--destructive-foreground))' },
        high: { backgroundColor: priorityColors.high, color: 'hsl(var(--card-foreground))' },
        medium: { backgroundColor: priorityColors.medium, color: 'hsl(var(--primary-foreground))' },
        low: { backgroundColor: priorityColors.low, color: 'hsl(var(--muted-foreground))' },
    };

    return { modifiers, modifiersStyles };

  }, [tasksWithDueDate]);


  const tasksForSelectedDate = selectedDate
    ? tasksWithDueDate.filter(task => format(new Date(task.dueDate!), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
    : [];

  if (loading || !project) {
    return (
      <div className="p-4 md:p-8 grid gap-8 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2"><Skeleton className="h-[500px] w-full" /></div >
        <div><Skeleton className="h-[500px] w-full" /></div >
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
       <Card>
        <CardHeader>
            <CardTitle>Calendario del Proyecto</CardTitle>
            <CardDescription>Visualiza las fechas de entrega de tu proyecto.</CardDescription>
        </CardHeader>
         <CardContent className="grid gap-8 grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2 flex flex-col items-center">
                 <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border p-4 w-full"
                    locale={es}
                    modifiers={modifiers}
                    modifiersStyles={modifiersStyles}
                    numberOfMonths={1}
                />
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-sm">
                    {priorityOrder.map(p => (
                        <div key={p} className="flex items-center gap-2">
                             <span className="h-4 w-4 rounded-full" style={{ backgroundColor: priorityColors[p] }} />
                             <span className="capitalize">{p}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="space-y-4">
                 <h3 className="text-lg font-semibold">
                    Tareas para {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : 'la fecha seleccionada'}
                </h3>
                {tasksForSelectedDate.length > 0 ? (
                    <ul className="space-y-2">
                        {tasksForSelectedDate.map(task => (
                            <li key={task.id} className="p-3 bg-muted rounded-md text-sm">
                                <div className="flex items-center">
                                    <span className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: priorityColors[task.priority] }} />
                                    <p className="font-medium flex-1">{task.title}</p>
                                </div>
                                <div className="flex justify-between items-center mt-1 pl-4">
                                    <Badge variant="outline" className="capitalize">{task.status}</Badge>
                                    {task.assignee && <span className="text-muted-foreground">{task.assignee.name}</span>}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No hay tareas con fecha límite para este día.</p>
                )}
            </div>
         </CardContent>
       </Card>
    </div>
  );
}

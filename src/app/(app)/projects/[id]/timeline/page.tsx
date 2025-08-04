
'use client';

import { useProject } from '../layout';
import { getTasksForProject } from '@/lib/firebase-services';
import { useEffect, useState, useMemo } from 'react';
import type { Task } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, differenceInDays, addDays, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import React from 'react';

export default function ProjectTimelinePage() {
  const project = useProject();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (project) {
      const unsubscribe = getTasksForProject(project.id, (fetchedTasks) => {
        setTasks(fetchedTasks);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [project]);
  
  const { tasksWithDates, timelineStart, timelineEnd, totalDays } = useMemo(() => {
    // Filter tasks that have at least a due date.
    const tasksWithDates = tasks.filter(task => task.dueDate);
    if (tasksWithDates.length === 0) {
        return { tasksWithDates: [], timelineStart: new Date(), timelineEnd: addDays(new Date(), 30), totalDays: 30 };
    }

    // A task's start date is either its 'startDate' or its 'dueDate' if 'startDate' is missing.
    const allDates = tasksWithDates.flatMap(t => [
        new Date(t.startDate || t.dueDate!),
        new Date(t.dueDate!)
    ]);

    const timelineStart = startOfDay(new Date(Math.min(...allDates.map(d => d.getTime()))));
    const timelineEnd = startOfDay(new Date(Math.max(...allDates.map(d => d.getTime()))));
    
    // Add some padding to the timeline
    const paddedStart = addDays(timelineStart, -2);
    const paddedEnd = addDays(timelineEnd, 2);

    const totalDays = differenceInDays(paddedEnd, paddedStart) + 1;

    return { tasksWithDates, timelineStart: paddedStart, timelineEnd: paddedEnd, totalDays };

  }, [tasks]);


  if (loading || !project) {
    return (
      <div className="p-4 md:p-8">
        <Card><Skeleton className="h-96 w-full" /></Card>
      </div>
    );
  }
  
  const getBarStyles = (task: Task) => {
    // A task must have a due date to be rendered
    if (!task.dueDate) return { gridColumn: '1 / span 1', display: 'none' };
    
    // Default to a 1-day event if no start date
    const start = startOfDay(new Date(task.startDate || task.dueDate));
    const end = startOfDay(new Date(task.dueDate));

    const startOffset = differenceInDays(start, timelineStart);
    // Duration must be at least 1 day
    const duration = differenceInDays(end, start) + 1;

    return {
      gridColumn: `${startOffset + 2} / span ${duration > 0 ? duration : 1}`
    }
  }

  return (
    <div className="p-4 md:p-8">
       <Card>
        <CardHeader>
            <CardTitle>Cronograma del Proyecto</CardTitle>
            <CardDescription>Visualiza la duración y la planificación de las tareas.</CardDescription>
        </CardHeader>
        <CardContent>
            {tasksWithDates.length > 0 ? (
                <div className="overflow-x-auto">
                    <div className="grid gap-y-2" style={{ gridTemplateColumns: `minmax(150px, 0.5fr) repeat(${totalDays > 0 ? totalDays : 1}, minmax(40px, 1fr))`}}>
                        {/* Header */}
                        <div className="sticky left-0 bg-background z-10 font-semibold p-2 border-b">Tarea</div>
                        {Array.from({ length: totalDays }).map((_, i) => (
                             <div key={i} className="text-center text-xs text-muted-foreground p-2 border-b border-l">
                                {format(addDays(timelineStart, i), 'd MMM', {locale: es})}
                             </div>
                        ))}

                        {/* Rows */}
                        {tasksWithDates.map(task => (
                            <React.Fragment key={task.id}>
                                <div className="sticky left-0 bg-background z-10 p-2 border-b flex items-center gap-3 truncate">
                                     {task.assignee && (
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={task.assignee.avatarUrl} />
                                            <AvatarFallback>{task.assignee.initials}</AvatarFallback>
                                        </Avatar>
                                     )}
                                    <span className="truncate">{task.title}</span>
                                </div>
                                <div className="col-span-full grid" style={{ gridTemplateColumns: `subgrid`}}>
                                    <div style={getBarStyles(task)} className="bg-primary/80 rounded-lg h-6 my-auto flex items-center px-2 text-primary-foreground text-xs truncate">
                                        <span className="truncate">{task.title}</span>
                                    </div>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-muted-foreground">No hay tareas con fechas de entrega para mostrar.</p>
                    <p className="text-sm text-muted-foreground mt-2">Asegúrate de que tus tareas tengan `dueDate`.</p>
                </div>
            )}
        </CardContent>
       </Card>
    </div>
  );
}


'use client';

import { useProject } from '../layout';
import { getTasksForProject } from '@/lib/firebase-services';
import { useEffect, useState } from 'react';
import type { Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

  const modifiers = {
    due: tasksWithDueDate.map(task => new Date(task.dueDate!))
  };

  const modifiersStyles = {
    due: {
      color: 'hsl(var(--primary-foreground))',
      backgroundColor: 'hsl(var(--primary))',
    },
  };

  const tasksForSelectedDate = selectedDate
    ? tasksWithDueDate.filter(task => format(new Date(task.dueDate!), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
    : [];

  if (loading || !project) {
    return (
      <div className="p-4 md:p-8 grid gap-8 grid-cols-1 md:grid-cols-3">
        <div className="md:col-span-2"><Skeleton className="h-[500px] w-full" /></div>
        <div><Skeleton className="h-[500px] w-full" /></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
       <Card>
        <CardHeader>
            <CardTitle>Calendario del Proyecto</CardTitle>
            <CardDescription>Visualiza las fechas de entrega y los hitos importantes de tu proyecto.</CardDescription>
        </CardHeader>
         <CardContent className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 flex justify-center">
                 <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border p-4"
                    locale={es}
                    modifiers={modifiers}
                    modifiersStyles={modifiersStyles}
                    numberOfMonths={1}
                />
            </div>
            <div className="space-y-4">
                 <h3 className="text-lg font-semibold">
                    Tareas para {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : 'la fecha seleccionada'}
                </h3>
                {tasksForSelectedDate.length > 0 ? (
                    <ul className="space-y-2">
                        {tasksForSelectedDate.map(task => (
                            <li key={task.id} className="p-3 bg-muted rounded-md text-sm">
                                <p className="font-medium">{task.title}</p>
                                <div className="flex justify-between items-center mt-1">
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


'use client';

import { useProject } from '../layout';
import { getTasksForProject } from '@/lib/firebase-services';
import { useEffect, useState, useMemo } from 'react';
import type { Task, TeamMember } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, PieChart, Bar, Pie, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

export default function ProjectAnalyticsPage() {
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
  
  const tasksByStatus = useMemo(() => {
    const counts = { backlog: 0, 'in-progress': 0, review: 0, done: 0 };
    tasks.forEach(task => {
        if (counts[task.status] !== undefined) {
            counts[task.status]++;
        }
    });
    return [
      { name: 'Pendiente', value: counts.backlog, fill: 'var(--chart-1)' },
      { name: 'En Progreso', value: counts['in-progress'], fill: 'var(--chart-2)' },
      { name: 'En Revisión', value: counts.review, fill: 'var(--chart-3)' },
      { name: 'Hecho', value: counts.done, fill: 'var(--chart-4)' },
    ];
  }, [tasks]);
  
  const tasksByAssignee = useMemo(() => {
    const counts: { [key: string]: number } = {};
    if (!project) return [];
    
    // Initialize counts for all team members
    project.team.forEach(member => {
        counts[member.name] = 0;
    });

    tasks.forEach(task => {
        if (task.assignee) {
            counts[task.assignee.name]++;
        }
    });

    return Object.entries(counts).map(([name, value], index) => ({
      name,
      value,
      fill: `var(--chart-${(index % 5) + 1})`
    }));
  }, [tasks, project]);

  if (loading || !project) {
    return (
      <div className="p-4 md:p-8 grid gap-8 grid-cols-1 lg:grid-cols-2">
        <Card><Skeleton className="h-96 w-full" /></Card>
        <Card><Skeleton className="h-96 w-full" /></Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <h2 className="text-2xl font-bold">Analíticas del Proyecto</h2>
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
         <Card>
            <CardHeader>
                <CardTitle>Distribución de Tareas por Estado</CardTitle>
                <CardDescription>Visualiza cuántas tareas hay en cada fase del flujo de trabajo.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{}} className="h-80 w-full">
                    <ResponsiveContainer>
                        <BarChart data={tasksByStatus} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                content={<ChartTooltipContent />}
                                cursor={{ fill: 'hsl(var(--muted))' }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Carga de Trabajo por Miembro</CardTitle>
                <CardDescription>Analiza cómo se distribuyen las tareas asignadas entre el equipo.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{}} className="h-80 w-full">
                    <ResponsiveContainer>
                        <PieChart>
                             <Tooltip content={<ChartTooltipContent nameKey="name" />} />
                            <Pie
                                data={tasksByAssignee}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={120}
                                labelLine={false}
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            >
                                {tasksByAssignee.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                 </ChartContainer>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

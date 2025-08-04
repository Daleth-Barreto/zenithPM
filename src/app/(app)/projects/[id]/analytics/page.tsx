
'use client';

import { useProject } from '../layout';
import { getTasksForProject } from '@/lib/firebase-services';
import { useEffect, useState, useMemo } from 'react';
import type { Task, TeamMember } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, PieChart, Bar, Pie, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

// Función para generar una paleta de colores a partir de un color base
function generateColorPalette(baseColor: string, count: number): string[] {
  const palette: string[] = [];
  try {
    const baseRgb = parseInt(baseColor.slice(1), 16);
    let r = (baseRgb >> 16) & 255;
    let g = (baseRgb >> 8) & 255;
    let b = baseRgb & 255;

    for (let i = 0; i < count; i++) {
      const factor = 1 - (i * 0.15);
      const newR = Math.min(255, Math.floor(r * factor));
      const newG = Math.min(255, Math.floor(g * factor));
      const newB = Math.min(255, Math.floor(b * factor));
      palette.push(`rgb(${newR}, ${newG}, ${newB})`);
    }
  } catch(e) {
    // Fallback en caso de color inválido
    for (let i = 0; i < count; i++) {
        palette.push(`hsl(var(--chart-${(i % 5) + 1}))`);
    }
  }
  return palette;
}

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

  const colorPalette = useMemo(() => {
    if (!project?.color) return ['hsl(var(--primary))'];
    return generateColorPalette(project.color, 5);
  }, [project?.color]);
  
  const tasksByStatus = useMemo(() => {
    const counts = { backlog: 0, 'in-progress': 0, review: 0, done: 0 };
    tasks.forEach(task => {
        if (counts[task.status] !== undefined) {
            counts[task.status]++;
        }
    });
    return [
      { name: 'Pendiente', value: counts.backlog },
      { name: 'En Progreso', value: counts['in-progress'] },
      { name: 'En Revisión', value: counts.review },
      { name: 'Hecho', value: counts.done },
    ];
  }, [tasks]);
  
  const tasksByAssignee = useMemo(() => {
    const counts: { [key: string]: number } = {};
    if (!project) return [];
    
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
      fill: colorPalette[index % colorPalette.length]
    }));
  }, [tasks, project, colorPalette]);

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
      <div className="grid gap-8 grid-cols-1 xl:grid-cols-2">
         <Card>
            <CardHeader>
                <CardTitle>Tareas por Estado</CardTitle>
                <CardDescription>Visualiza cuántas tareas hay en cada fase.</CardDescription>
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
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={project.color}>
                                {tasksByStatus.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colorPalette[index % colorPalette.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Carga de Trabajo</CardTitle>
                <CardDescription>Analiza la distribución de tareas en el equipo.</CardDescription>
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

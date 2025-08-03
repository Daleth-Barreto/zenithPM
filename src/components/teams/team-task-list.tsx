
'use client';

import { useState, useEffect } from 'react';
import type { Task, Project } from '@/lib/types';
import { getTasksForTeam } from '@/lib/firebase-services';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowDown, ArrowRight, ArrowUp, Briefcase } from 'lucide-react';
import Link from 'next/link';

interface TeamTaskListProps {
  teamId: string;
}

const priorityIcons: Record<Task['priority'], React.ReactNode> = {
  low: <ArrowDown className="h-4 w-4 text-gray-500" />,
  medium: <ArrowRight className="h-4 w-4 text-yellow-500" />,
  high: <ArrowUp className="h-4 w-4 text-orange-500" />,
  urgent: <ArrowUp className="h-4 w-4 text-red-500" />,
};

type GroupedTasks = {
    [projectName: string]: (Task & { projectName: string, projectId: string })[];
}

export function TeamTaskList({ teamId }: TeamTaskListProps) {
    const [tasks, setTasks] = useState<(Task & { projectName: string, projectId: string })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!teamId) return;

        const unsubscribe = getTasksForTeam(teamId, (teamTasks) => {
            setTasks(teamTasks);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [teamId]);

    const groupedTasks = tasks.reduce((acc, task) => {
        const { projectName } = task;
        if (!acc[projectName]) {
            acc[projectName] = [];
        }
        acc[projectName].push(task);
        return acc;
    }, {} as GroupedTasks);

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        )
    }

    if (tasks.length === 0) {
        return (
            <Card className="flex flex-col items-center justify-center py-16 text-center">
                 <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
                <CardTitle>Sin Tareas Asignadas</CardTitle>
                <CardDescription className="mt-2">
                    Este equipo aún no tiene tareas asignadas en ningún proyecto.
                </CardDescription>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Carga de Trabajo del Equipo</CardTitle>
                <CardDescription>
                    Aquí se muestran todas las tareas asignadas a este equipo en los diferentes proyectos.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" className="w-full space-y-4" defaultValue={Object.keys(groupedTasks)}>
                    {Object.entries(groupedTasks).map(([projectName, projectTasks]) => (
                        <AccordionItem value={projectName} key={projectName} className="border bg-muted/20 rounded-lg px-4">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-4">
                                     <Briefcase className="h-5 w-5 text-primary" />
                                    <span className="text-lg font-semibold">{projectName}</span>
                                    <Badge variant="secondary">{projectTasks.length} tareas</Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-2 pt-2">
                                    {projectTasks.map(task => (
                                        <Link href={`/projects/${task.projectId}/board`} key={task.id} className="block">
                                            <div className="flex items-center justify-between p-3 rounded-md border bg-background hover:bg-muted/50 transition-colors">
                                                <div>
                                                    <p className="font-medium">{task.title}</p>
                                                    {task.description && <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>}
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Badge variant="outline" className="capitalize">
                                                        {priorityIcons[task.priority]}
                                                        <span className="ml-2">{task.priority}</span>
                                                    </Badge>
                                                    {task.assignee && (
                                                         <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <Avatar className="h-8 w-8">
                                                                        <AvatarImage src={task.assignee.avatarUrl} />
                                                                        <AvatarFallback>{task.assignee.initials}</AvatarFallback>
                                                                    </Avatar>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Asignado a: {task.assignee.name}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    )
}

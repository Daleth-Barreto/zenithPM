
'use client';

import { useState, useEffect } from 'react';
import type { Task } from '@/lib/types';
import { getTasksForUser } from '@/lib/firebase-services';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowDown, ArrowRight, ArrowUp, Briefcase, CheckSquare, FolderKanban } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';

const priorityIcons: Record<Task['priority'], React.ReactNode> = {
  low: <ArrowDown className="h-4 w-4 text-gray-500" />,
  medium: <ArrowRight className="h-4 w-4 text-yellow-500" />,
  high: <ArrowUp className="h-4 w-4 text-orange-500" />,
  urgent: <ArrowUp className="h-4 w-4 text-red-500" />,
};

type GroupedTasks = {
    [projectName: string]: (Task & { projectName: string, projectId: string })[];
}

export function UserTaskList() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<(Task & { projectName: string, projectId: string })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const unsubscribe = getTasksForUser(user.uid, (userTasks) => {
            setTasks(userTasks);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

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
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-72" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-16 w-full" />
                </CardContent>
            </Card>
        )
    }

    if (tasks.length === 0) {
        return (
            <Card className="flex flex-col items-center justify-center py-16 text-center">
                 <CheckSquare className="h-16 w-16 text-muted-foreground mb-4" />
                <CardTitle>¡Bandeja de entrada limpia!</CardTitle>
                <CardDescription className="mt-2">
                    No tienes ninguna tarea asignada en este momento.
                </CardDescription>
            </Card>
        )
    }

    return (
        <Card>
            <CardContent className="p-4 md:p-6">
                <Accordion type="multiple" className="w-full space-y-4" defaultValue={Object.keys(groupedTasks)}>
                    {Object.entries(groupedTasks).map(([projectName, projectTasks]) => (
                        <AccordionItem value={projectName} key={projectName} className="border bg-muted/20 rounded-lg px-4">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-4">
                                     <FolderKanban className="h-5 w-5 text-primary" />
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
                                                     <Badge variant="secondary" className="capitalize">{task.status}</Badge>
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

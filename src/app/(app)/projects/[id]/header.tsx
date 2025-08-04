
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Project } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ScheduleMeetingDialog } from '@/components/meetings/schedule-meeting-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { PanelTopOpen, ChevronDown } from 'lucide-react';

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const pathname = usePathname();
  const [isNavOpen, setIsNavOpen] = useState(true);

  const getActiveTab = () => {
    const segments = pathname.split('/');
    return segments[segments.length - 1] || 'board';
  };

  const tabs = [
    { id: 'board', label: 'Tablero', href: `/projects/${project.id}/board` },
    { id: 'tasks', label: 'Tareas', href: `/projects/${project.id}/tasks` },
    { id: 'timeline', label: 'Cronograma', href: `/projects/${project.id}/timeline` },
    { id: 'calendar', label: 'Calendario', href: `/projects/${project.id}/calendar` },
    { id: 'teams', label: 'Equipos', href: `/projects/${project.id}/teams` },
    { id: 'analytics', label: 'Analíticas', href: `/projects/${project.id}/analytics` },
    { id: 'settings', label: 'Configuración', href: `/projects/${project.id}/settings` },
  ];

  return (
    <div className="border-b">
        <div className="p-4 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{project.name}</h1>
                <p className="text-muted-foreground mt-2">{project.description}</p>
            </div>
            <ScheduleMeetingDialog project={project} />
        </div>
        <Collapsible open={isNavOpen} onOpenChange={setIsNavOpen} className="px-4 md:px-8 pb-4">
            <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                    <PanelTopOpen className="mr-2 h-4 w-4" />
                     Menú
                    <ChevronDown className={cn("h-4 w-4 ml-2 transition-transform", isNavOpen && "rotate-180")} />
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <ScrollArea className="w-full whitespace-nowrap pt-4">
                    <Tabs value={getActiveTab()} className="pb-px">
                    <TabsList>
                        {tabs.map((tab) => (
                        <TabsTrigger value={tab.id} key={tab.id} asChild>
                            <Link href={tab.href}>{tab.label}</Link>
                        </TabsTrigger>
                        ))}
                    </TabsList>
                    </Tabs>
                </ScrollArea>
            </CollapsibleContent>
        </Collapsible>
    </div>
  );
}

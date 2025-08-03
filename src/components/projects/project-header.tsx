
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Project } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const pathname = usePathname();

  const getActiveTab = () => {
    if (pathname.endsWith('/board')) return 'board';
    if (pathname.endsWith('/tasks')) return 'tasks';
    if (pathname.endsWith('/calendar')) return 'calendar';
    if (pathname.endsWith('/teams')) return 'teams';
    if (pathname.endsWith('/analytics')) return 'analytics';
    if (pathname.endsWith('/settings')) return 'settings';
    return 'board';
  };

  const tabs = [
    { id: 'board', label: 'Tablero', href: `/projects/${project.id}/board` },
    { id: 'tasks', label: 'Tareas', href: `/projects/${project.id}/tasks` },
    { id: 'teams', label: 'Equipos', href: `/projects/${project.id}/teams` },
    { id: 'calendar', label: 'Calendario', href: `/projects/${project.id}/calendar` },
    { id: 'analytics', label: 'Analíticas', href: `/projects/${project.id}/analytics` },
    { id: 'settings', label: 'Configuración', href: `/projects/${project.id}/settings` },
  ];

  return (
    <div className="border-b">
      <div className="p-4 md:p-8">
        <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
        <p className="text-muted-foreground mt-2">{project.description}</p>
      </div>
       <ScrollArea className="w-full whitespace-nowrap">
        <Tabs value={getActiveTab()} className="px-4 md:px-8 pb-px">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger value={tab.id} key={tab.id} asChild>
                <Link href={tab.href}>{tab.label}</Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </ScrollArea>
    </div>
  );
}

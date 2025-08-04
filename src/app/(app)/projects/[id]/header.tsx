
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Project } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScheduleMeetingDialog } from '@/components/meetings/schedule-meeting-dialog';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const pathname = usePathname();

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

  const activeTabLabel = tabs.find(tab => tab.id === getActiveTab())?.label || 'Menú';

  return (
    <div className="border-b">
        <div className="p-4 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{project.name}</h1>
                <p className="text-muted-foreground mt-2">{project.description}</p>
            </div>
            <ScheduleMeetingDialog project={project} />
        </div>
        
        {/* Desktop Tabs */}
        <div className="hidden md:block px-4 md:px-8 pb-4">
             <Tabs value={getActiveTab()} className="pb-px">
                <TabsList>
                    {tabs.map((tab) => (
                    <TabsTrigger value={tab.id} key={tab.id} asChild>
                        <Link href={tab.href}>{tab.label}</Link>
                    </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </div>

        {/* Mobile Dropdown */}
        <div className="block md:hidden px-4 md:px-8 pb-4">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                       {activeTabLabel}
                        <Menu className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                     {tabs.map((tab) => (
                        <DropdownMenuItem key={tab.id} asChild>
                            <Link href={tab.href}>{tab.label}</Link>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    </div>
  );
}

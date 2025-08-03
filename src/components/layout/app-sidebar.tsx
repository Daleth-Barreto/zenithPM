
'use client';

import Link from 'next/link';
import {
  LayoutDashboard,
  FolderKanban,
  User,
  Users, // Icon for Teams
  ChevronDown,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname } from 'next/navigation';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { useAuth } from '@/contexts/auth-context';
import { generateAvatar } from '@/lib/avatar';
import { useEffect, useState } from 'react';
import type { Project } from '@/lib/types';
import { getProjectsForUser } from '@/lib/firebase-services';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const { state: sidebarState } = useSidebar();

  useEffect(() => {
    if (user) {
      const unsubscribe = getProjectsForUser(user.uid, (projects) => {
        setProjects(projects);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!user) {
    return null; // Or a loading component
  }

  const userAvatar = user.photoURL || generateAvatar(user.displayName || user.email || 'User');
  const isSidebarCollapsed = sidebarState === 'collapsed';

  return (
    <Sidebar>
      <SidebarHeader>
        <div className={cn("flex items-center gap-2", isSidebarCollapsed && "justify-center")}>
          <Logo className="h-8 w-8 text-primary" />
          <span className={cn("text-xl font-semibold", isSidebarCollapsed && "hidden")}>ZenithPM</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard')}
              tooltip={{ children: 'Panel' }}
            >
              <Link href="/dashboard">
                <LayoutDashboard />
                <span className={cn(isSidebarCollapsed && "hidden")}>Panel</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <Collapsible defaultOpen={true} data-tour="sidebar-projects">
            <CollapsibleTrigger asChild>
                <SidebarMenuButton className="justify-between group-data-[collapsible=icon]:justify-center">
                    <div className="flex items-center gap-2">
                        <FolderKanban />
                        <span className={cn(isSidebarCollapsed && "hidden")}>Proyectos</span>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180", isSidebarCollapsed && "hidden")} />
                </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {projects.map((project) => (
                  <SidebarMenuSubItem key={project.id}>
                    <SidebarMenuSubButton asChild isActive={isActive(`/projects/${project.id}`)}>
                      <Link href={`/projects/${project.id}/board`}>
                        <span
                          className="w-2 h-2 rounded-full"
                           style={{ backgroundColor: project.color || '#888' }}
                        />
                        <span>{project.name}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/teams')}
              tooltip={{ children: 'Equipos' }}
            >
              <Link href="/teams">
                <Users />
                <span className={cn(isSidebarCollapsed && "hidden")}>Equipos</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/profile')}
              tooltip={{ children: 'Perfil' }}
            >
              <Link href="/profile">
                <User />
                <span className={cn(isSidebarCollapsed && "hidden")}>Perfil</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <div className={cn("flex items-center gap-3", isSidebarCollapsed && "justify-center")}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={userAvatar} />
              <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
            <div className={cn("flex flex-col", isSidebarCollapsed && "hidden")}>
              <span className="font-semibold text-sm">{user.displayName || 'Usuario'}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
      </SidebarFooter>
    </Sidebar>
  );
}

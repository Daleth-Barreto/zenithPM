
'use client';

import Link from 'next/link';
import {
  LayoutDashboard,
  FolderKanban,
  User,
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
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname } from 'next/navigation';
import { mockProjects } from '@/lib/mock-data';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { useAuth } from '@/contexts/auth-context';

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!user) {
    return null; // Or a loading component
  }

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarContent>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold">ZenithPM</span>
          </div>
        </SidebarHeader>
        <SidebarMenu className="flex-1 p-4">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard')}
              tooltip={{ children: 'Panel' }}
            >
              <Link href="/dashboard">
                <LayoutDashboard />
                <span>Panel</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <Collapsible defaultOpen={true}>
            <CollapsibleTrigger className="w-full group/menu-item">
              <SidebarMenuButton className="justify-between group-data-[collapsible=icon]:justify-center">
                <div className="flex items-center gap-2">
                  <FolderKanban />
                  <span>Proyectos</span>
                </div>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {mockProjects.map((project) => (
                  <SidebarMenuSubItem key={project.id}>
                    <SidebarMenuSubButton asChild isActive={isActive(`/projects/${project.id}`)}>
                      <Link href={`/projects/${project.id}/board`}>
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: project.imageUrl.match(/(\w+)\/\w+$/)?.[1]
                              ? `#${project.imageUrl.match(/(\w+)\/\w+$/)?.[1]}`
                              : '#888',
                          }}
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
              isActive={isActive('/profile')}
              tooltip={{ children: 'Perfil' }}
            >
              <Link href="/profile">
                <User />
                <span>Perfil</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <Separator className="my-2" />

        <SidebarFooter className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="font-semibold text-sm">{user.displayName}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}

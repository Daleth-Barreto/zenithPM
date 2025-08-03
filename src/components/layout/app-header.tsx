
'use client';

import Link from 'next/link';
import {
  Bell,
  Search,
  User as UserIcon,
  LogOut,
  Settings,
  PanelLeft,
  Check,
  Mail,
  X,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useSidebar } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { generateAvatar } from '@/lib/avatar';
import { useEffect, useState } from 'react';
import type { Invitation, Notification } from '@/lib/types';
import { getInvitationsForUser, respondToInvitation, getNotificationsForUser, markNotificationAsRead } from '@/lib/firebase-services';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function AppHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const { toast } = useToast();

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user?.email) {
      const unsubscribeInvites = getInvitationsForUser(user.email, setInvitations);
      const unsubscribeNotifs = getNotificationsForUser(user.uid, setNotifications);
      return () => {
        unsubscribeInvites();
        unsubscribeNotifs();
      }
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };
  
  const handleInvitationResponse = async (invitationId: string, accept: boolean) => {
    if (!user) return;
    try {
      await respondToInvitation(invitationId, accept, user);
      toast({
        title: accept ? 'Invitación Aceptada' : 'Invitación Rechazada',
        description: accept ? 'Has sido añadido al nuevo equipo/proyecto.' : 'La invitación ha sido rechazada.',
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: (error as Error).message,
      });
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.link) {
      router.push(notification.link);
    }
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }
  };

  if (!user) {
    return null; 
  }
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const userAvatar = user.photoURL || generateAvatar(user.displayName || user.email || 'User');
  const unreadCount = notifications.filter(n => !n.read).length + invitations.length;

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
        <PanelLeft className="h-5 w-5" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
      <Button variant="ghost" size="icon" className="hidden md:flex" onClick={toggleSidebar}>
        <PanelLeft className="h-5 w-5" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar proyectos o tareas..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 justify-center p-0">{unreadCount}</Badge>
            )}
            <span className="sr-only">Alternar notificaciones</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-96">
            <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {invitations.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground px-2">Invitaciones</DropdownMenuLabel>
                {invitations.map((invitation) => (
                <DropdownMenuItem key={invitation.id} className="flex gap-3 items-center justify-between focus:bg-transparent" onSelect={(e) => e.preventDefault()}>
                  <div className="flex gap-3 items-start">
                      <div className="mt-1 text-muted-foreground"><Mail className="h-4 w-4" /></div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm leading-tight">Invitación para unirse a {invitation.targetName}</span>
                        <span className="text-xs text-muted-foreground">De: {invitation.inviterName}</span>
                      </div>
                  </div>
                  <div className="flex gap-2">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-green-500 hover:text-green-500 hover:bg-green-500/10" onClick={() => handleInvitationResponse(invitation.id, true)}><Check /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-500 hover:bg-red-500/10" onClick={() => handleInvitationResponse(invitation.id, false)}><X /></Button>
                  </div>
                </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            )}
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} onSelect={() => handleNotificationClick(notification)} className={!notification.read ? 'bg-muted/50' : ''}>
                  <div className="flex gap-3 items-start">
                    <div className="mt-1 text-muted-foreground">
                        {notification.message.includes('reunión') ? <Video className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true, locale: es })}
                      </p>
                    </div>
                  </div>
              </DropdownMenuItem>
              ))
            ) : (
                <div className="text-center text-sm text-muted-foreground p-4">
                    No tienes notificaciones.
                </div>
            )}
             {invitations.length === 0 && notifications.length === 0 && (
                 <div className="text-center text-sm text-muted-foreground p-4">
                    No tienes notificaciones pendientes.
                </div>
             )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full" data-tour="user-menu">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userAvatar} alt={user.displayName || 'User'} />
              <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
            <span className="sr-only">Alternar menú de usuario</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="font-semibold">{user.displayName || 'Usuario'}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configuración</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

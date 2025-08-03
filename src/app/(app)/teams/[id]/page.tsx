
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { onTeamUpdate, removeMemberFromTeam, addMemberToTeam, updateTeamMemberRoleInTeam } from '@/lib/firebase-services';
import type { Team, TeamMember } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Loader2, Trash2, UserPlus, Copy, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeamTaskList } from '@/components/teams/team-task-list';

export default function TeamManagementPage() {
  const params = useParams();
  const teamId = params.id as string;
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    if (teamId) {
      const unsubscribe = onTeamUpdate(teamId, (t) => {
        if (t) {
          setTeam(t);
        } else {
          toast({ variant: 'destructive', title: 'Error', description: 'No se pudo encontrar el equipo.' });
          router.push('/teams');
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [teamId, router, toast]);
  
  const canManageTeam = team?.members.find(m => m.id === user?.uid)?.role === 'Admin';
  
  const handleAddMember = async () => {
    if (!inviteEmail || !team || !user) return;
    setIsInviting(true);
    try {
        const result = await addMemberToTeam(team.id, inviteEmail, user);
        if (result.success) {
          toast({ title: 'Invitación Enviada', description: `Se ha enviado una invitación a ${inviteEmail}.` });
        } else {
           toast({
              title: 'Usuario no encontrado',
              description: (
                <div className="flex flex-col gap-2">
                  <span>Este usuario no está en ZenithPM. Cópia y envíale este enlace para que se una:</span>
                  <div className="flex items-center gap-2 mt-2 p-2 rounded-md bg-muted">
                    <Input readOnly value={result.inviteLink} className="text-xs" />
                    <Button size="icon" variant="ghost" onClick={() => navigator.clipboard.writeText(result.inviteLink)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ),
              duration: 10000,
            });
        }
        setInviteEmail('');
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
    } finally {
        setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!team) return;
    try {
        await removeMemberFromTeam(team.id, memberId);
        toast({ title: 'Miembro Eliminado', description: 'El miembro ha sido eliminado del equipo.' });
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar al miembro.' });
    }
  };
  
  const handleRoleChange = async (memberId: string, role: 'Admin' | 'Miembro') => {
    if (!team) return;
    try {
        await updateTeamMemberRoleInTeam(team.id, memberId, role);
        toast({ title: 'Rol Actualizado', description: 'Se ha actualizado el rol del miembro.' });
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar el rol.' });
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-8">
        <Skeleton className="h-10 w-1/3" />
        <Card>
          <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-10 w-32" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!team) {
    return null;
  }
  
  return (
    <div className="p-4 md:p-8 space-y-8">
       <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestionar Equipo: {team.name}</h2>
        <p className="text-muted-foreground">Añade o elimina miembros, gestiona sus roles y visualiza sus tareas.</p>
       </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList>
          <TabsTrigger value="members">Miembros</TabsTrigger>
          <TabsTrigger value="tasks">Tareas del Equipo</TabsTrigger>
        </TabsList>
        <TabsContent value="members" className="mt-6">
            <Card>
              <CardHeader>
                  <CardTitle>Miembros del Equipo</CardTitle>
                  <CardDescription>{team.members.length} miembros en este equipo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  {team.members.map(member => (
                      <div key={member.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-2 rounded-md hover:bg-muted/50">
                          <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                              <AvatarImage src={member.avatarUrl} />
                              <AvatarFallback>{member.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                              <p className="font-medium text-lg">{member.name}</p>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Select
                              defaultValue={member.role}
                              onValueChange={(value: 'Admin' | 'Miembro') => handleRoleChange(member.id, value)}
                              disabled={!canManageTeam || (member.id === user?.uid && team.ownerId === user?.uid)}
                          >
                              <SelectTrigger className="w-full sm:w-36">
                                  <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                              <SelectItem value="Admin">Admin</SelectItem>
                              <SelectItem value="Miembro">Miembro</SelectItem>
                              </SelectContent>
                          </Select>
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-muted-foreground" disabled={!canManageTeam || (member.id === user?.uid && team.ownerId === user?.uid)}>
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                  Esta acción eliminará permanentemente al miembro del equipo.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRemoveMember(member.id)}>Eliminar</AlertDialogAction>
                              </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                          </div>
                      </div>
                  ))}
              </CardContent>
            </Card>
            
            {canManageTeam && (
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Invitar Nuevo Miembro</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Input 
                                type="email" 
                                placeholder="nuevo.miembro@example.com" 
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                disabled={isInviting}
                            />
                            <Button onClick={handleAddMember} disabled={isInviting || !inviteEmail} className="mt-2 sm:mt-0">
                                {isInviting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                Enviar Invitación
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </TabsContent>
        <TabsContent value="tasks" className="mt-6">
          <TeamTaskList teamId={teamId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

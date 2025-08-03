
'use client';

import { useEffect, useState } from 'react';
import { useProject } from '../layout';
import { getTeamsForProject, removeMemberFromTeam, addMemberToTeam, updateTeamMemberRoleInTeam } from '@/lib/firebase-services';
import type { Team, TeamMember } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Loader2, Trash2, UserPlus, Copy, Users, Settings } from 'lucide-react';
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
import { NewTeamDialog } from '@/components/teams/new-team-dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from '@/components/ui/sheet';
import { TeamTaskList } from '@/components/teams/team-task-list';
import { Separator } from '@/components/ui/separator';

export default function ProjectTeamsPage() {
  const project = useProject();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    if (project) {
      const unsubscribe = getTeamsForProject(project.id, (fetchedTeams) => {
        setTeams(fetchedTeams);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [project]);
  
  const onTeamCreated = (newTeam: Team) => {
    // Listener will handle the update
  };
  
  const canManageTeam = (team: Team) => team?.members.find(m => m.id === user?.uid)?.role === 'Admin';

  const handleAddMember = async () => {
    if (!inviteEmail || !selectedTeam || !user || !project) return;
    setIsInviting(true);
    try {
        const result = await addMemberToTeam(project.id, selectedTeam.id, inviteEmail, user);
        
        if (result.status === 'resent') {
          toast({ title: 'Invitación Reenviada', description: `Se ha reenviado la invitación pendiente a ${inviteEmail}.` });
        } else if(result.status === 'sent') {
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
    if (!selectedTeam || !project) return;
    try {
        await removeMemberFromTeam(project.id, selectedTeam.id, memberId);
        toast({ title: 'Miembro Eliminado', description: 'El miembro ha sido eliminado del equipo.' });
        // Refresh selected team
        const updatedTeam = teams.find(t => t.id === selectedTeam.id);
        if (updatedTeam) {
          const newMembers = updatedTeam.members.filter(m => m.id !== memberId);
          setSelectedTeam({...updatedTeam, members: newMembers});
        }

    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar al miembro.' });
    }
  };
  
  const handleRoleChange = async (memberId: string, role: 'Admin' | 'Miembro') => {
    if (!selectedTeam || !project) return;
    try {
        await updateTeamMemberRoleInTeam(project.id, selectedTeam.id, memberId, role);
        toast({ title: 'Rol Actualizado', description: 'Se ha actualizado el rol del miembro.' });
         // Refresh selected team
        const updatedTeam = teams.find(t => t.id === selectedTeam.id);
         if (updatedTeam) {
          const newMembers = updatedTeam.members.map(m => m.id === memberId ? {...m, role} : m);
          setSelectedTeam({...updatedTeam, members: newMembers});
        }
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar el rol.' });
    }
  };

  if (loading || !project) {
    return (
      <div className="p-4 md:p-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-[120px] w-full rounded-xl" />
            <div className="space-y-2 p-6 pt-0">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            </div>
        ))}
        </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Equipos del Proyecto</h2>
          <p className="text-muted-foreground">Gestiona los equipos de colaboración para este proyecto.</p>
        </div>
        <NewTeamDialog projectId={project.id} onTeamCreated={onTeamCreated} />
      </div>

      {teams.length > 0 ? (
        <div className="space-y-8">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <Card key={team.id} className="flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback><Users /></AvatarFallback>
                        </Avatar>
                        {team.name}
                    </CardTitle>
                    <CardDescription>{team.members.length} miembros</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                      <div className="flex -space-x-2">
                        {team.members.slice(0, 5).map((member) => (
                            <Avatar key={member.id} className="border-2 border-card">
                            <AvatarImage src={member.avatarUrl} alt={member.name} />
                            <AvatarFallback>{member.initials}</AvatarFallback>
                            </Avatar>
                        ))}
                        {team.members.length > 5 && (
                            <Avatar className="border-2 border-card">
                            <AvatarFallback>+{team.members.length - 5}</AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    <Sheet onOpenChange={(isOpen) => !isOpen && setSelectedTeam(null)}>
                      <SheetTrigger asChild>
                        <Button variant="outline" className="w-full" onClick={() => setSelectedTeam(team)}>
                          <Settings className="mr-2 h-4 w-4" />
                          Gestionar Equipo
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                        <SheetHeader>
                          <SheetTitle>Gestionar: {selectedTeam?.name}</SheetTitle>
                          <SheetDescription>Añade o elimina miembros y gestiona sus roles.</SheetDescription>
                        </SheetHeader>
                        <div className="py-6 space-y-6">
                          <Card>
                            <CardHeader><CardTitle>Miembros</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                              {selectedTeam?.members.map(member => (
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
                                            disabled={!selectedTeam || !canManageTeam(selectedTeam) || (member.id === user?.uid && selectedTeam.ownerId === user?.uid)}
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
                                            <Button variant="ghost" size="icon" className="text-muted-foreground" disabled={!selectedTeam || !canManageTeam(selectedTeam) || (member.id === user?.uid && selectedTeam.ownerId === user?.uid)}>
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
                          {selectedTeam && canManageTeam(selectedTeam) && (
                              <Card>
                                  <CardHeader><CardTitle>Invitar Nuevo Miembro</CardTitle></CardHeader>
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
                        </div>
                      </SheetContent>
                    </Sheet>
                </CardFooter>
              </Card>
            ))}
          </div>

          <Separator />
          
          <TeamTaskList teamId={teams[0].id} />

        </div>
      ) : (
         <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-8 sm:mt-16 py-16 sm:py-24">
          <div className="flex flex-col items-center gap-2 text-center p-4">
            <Users className="h-16 w-16 text-muted-foreground" />
            <h3 className="text-2xl font-bold tracking-tight">Aún no hay equipos</h3>
            <p className="text-sm text-muted-foreground">
              Comienza creando tu primer equipo para este proyecto.
            </p>
            <div className="mt-4">
              <NewTeamDialog projectId={project.id} onTeamCreated={onTeamCreated} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

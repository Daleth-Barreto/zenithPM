
'use client';

import { getProjectById, inviteTeamMember, removeTeamMember, updateTeamMemberRole, getTeamsForUser, getTeamById, addTeamToProject, removeTeamFromProject } from '@/lib/firebase-services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Loader2, Trash2, Users, Plus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Project, TeamMember, Team } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
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
import { useAuth } from '@/contexts/auth-context';


export default function ProjectSettingsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [associatedTeams, setAssociatedTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState('');

  useEffect(() => {
    if (projectId) {
      const unsubscribe = getProjectById(projectId, (p) => {
        if(p) {
          setProject(p);
          // Fetch full team objects based on associatedTeamIds
          const teamPromises = p.associatedTeamIds?.map(id => getTeamById(id)) || [];
          Promise.all(teamPromises).then(teams => {
            setAssociatedTeams(teams.filter((t): t is Team => t !== null));
          });
        }
        setLoading(false)
      });
      return () => unsubscribe();
    }
  }, [projectId]);

  useEffect(() => {
    if (user) {
      const unsubscribe = getTeamsForUser(user.uid, setUserTeams);
      return () => unsubscribe();
    }
  }, [user]);

  const handleInviteMember = async () => {
    if (!inviteEmail || !project) return;
    setIsInviting(true);
    try {
      const newMember = await inviteTeamMember(project.id, inviteEmail);
      // The onSnapshot listener will update the state automatically
      setInviteEmail('');
      toast({
        title: 'Invitación Enviada',
        description: `${newMember.name} ha sido añadido al proyecto.`
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error de Invitación',
        description: (error as Error).message,
      })
    } finally {
      setIsInviting(false);
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!project) return;
    try {
      await removeTeamMember(project.id, memberId);
      // The onSnapshot listener will update the state automatically
      toast({
        title: 'Miembro Eliminado',
        description: 'El miembro del equipo ha sido eliminado del proyecto.'
      })
    } catch (error) {
      console.error(error);
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar al miembro del equipo.',
      })
    }
  }

  const handleRoleChange = async (memberId: string, role: 'Admin' | 'Miembro') => {
    if (!project) return;
    try {
        await updateTeamMemberRole(project.id, memberId, role);
        toast({
            title: 'Rol Actualizado',
            description: `El rol del miembro ha sido cambiado a ${role}.`
        })
    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'No se pudo actualizar el rol del miembro.'
        });
    }
  }
  
  const handleAddTeamToProject = async () => {
    if (!selectedTeam || !project) return;
    try {
      await addTeamToProject(project.id, selectedTeam);
      setSelectedTeam('');
      toast({
        title: 'Equipo Añadido',
        description: 'El equipo ha sido añadido al proyecto.'
      });
    } catch (error) {
      console.error(error);
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo añadir el equipo.',
      })
    }
  }
  
  const handleRemoveTeamFromProject = async (teamId: string) => {
    if (!project) return;
    try {
      await removeTeamFromProject(project.id, teamId);
       toast({
        title: 'Equipo Eliminado',
        description: 'El equipo ha sido eliminado del proyecto.'
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar el equipo.',
      })
    }
  }


  if (loading) {
    return (
       <div className="p-4 md:p-8 space-y-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
               <Skeleton className="h-4 w-24" />
               <Skeleton className="h-10 w-full" />
            </div>
             <div className="space-y-2">
               <Skeleton className="h-4 w-32" />
               <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
       </div>
    )
  }

  if (!project) {
    return <div>Proyecto no encontrado</div>;
  }
  
  const canManageTeam = project.team.find(m => m.id === user?.uid)?.role === 'Admin';
  const availableTeams = userTeams.filter(ut => !project.associatedTeamIds?.includes(ut.id));

  return (
    <div className="p-4 md:p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Configuración General</CardTitle>
          <CardDescription>Actualiza el nombre y la descripción de tu proyecto.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">Nombre del Proyecto</Label>
            <Input id="projectName" defaultValue={project.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectDescription">Descripción del Proyecto</Label>
            <Textarea id="projectDescription" defaultValue={project.description} rows={3} />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Gestionar Equipos</CardTitle>
          <CardDescription>Asocia equipos a este proyecto para colaborar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-4">
             {associatedTeams.map(team => (
                <div key={team.id} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback><Users className="h-5 w-5"/></AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{team.name}</p>
                      <p className="text-sm text-muted-foreground">{team.members.length} miembros</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveTeamFromProject(team.id)} disabled={!canManageTeam}>
                      <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
             ))}
           </div>
           {canManageTeam && (
             <>
              <Separator />
                <div>
                  <h4 className="font-medium mb-2">Añadir Equipo al Proyecto</h4>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select onValueChange={setSelectedTeam} value={selectedTeam}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar un equipo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTeams.map(team => (
                          <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddTeamToProject} disabled={!selectedTeam} className="mt-2 sm:mt-0">
                      <Plus className="mr-2 h-4 w-4" />
                      Añadir Equipo
                    </Button>
                  </div>
                </div>
             </>
           )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Miembros Individuales</CardTitle>
          <CardDescription>Gestiona los miembros del equipo y sus roles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {project.team.map(member => (
              <div key={member.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={member.avatarUrl} />
                    <AvatarFallback>{member.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Select 
                    defaultValue={member.role}
                    onValueChange={(value: 'Admin' | 'Miembro') => handleRoleChange(member.id, value)}
                    disabled={!canManageTeam || member.id === user?.uid}
                  >
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Miembro">Miembro</SelectItem>
                    </SelectContent>
                  </Select>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button variant="ghost" size="icon" className="text-muted-foreground" disabled={!canManageTeam || member.id === user?.uid}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Esto eliminará permanentemente al miembro del proyecto.
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
          </div>
          {canManageTeam && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Invitar Miembro</h4>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input 
                    type="email" 
                    placeholder="nuevo.miembro@example.com" 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    disabled={isInviting}
                  />
                  <Button onClick={handleInviteMember} disabled={isInviting || !inviteEmail} className="mt-2 sm:mt-0">
                    {isInviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enviar Invitación
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Los miembros del equipo serán invitados a unirse a este proyecto por correo electrónico.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de Peligro</CardTitle>
          <CardDescription>Estas acciones son irreversibles. Procede con precaución.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">Eliminar Proyecto</Button>
        </CardContent>
      </Card>
    </div>
  );
}

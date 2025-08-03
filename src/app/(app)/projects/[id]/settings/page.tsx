
'use client';

import { inviteTeamMember, removeTeamMember, updateTeamMemberRole } from '@/lib/firebase-services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Loader2, Trash2, Copy } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
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
import { useProject } from '../layout';
import { Skeleton } from '@/components/ui/skeleton';


export default function ProjectSettingsPage() {
  const project = useProject();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const handleInviteMember = async () => {
    if (!inviteEmail || !project || !user) return;
    setIsInviting(true);
    try {
      const result = await inviteTeamMember(project.id, project, inviteEmail, user);
      
      if (result.success) {
        toast({
          title: 'Invitación Enviada',
          description: `Se ha enviado una invitación a ${inviteEmail}.`
        });
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

  if (!project) {
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
  
  const canManageTeam = project.team.find(m => m.id === user?.uid)?.role === 'Admin';

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
          <CardTitle>Gestión de Miembros Individuales</CardTitle>
          <CardDescription>Gestiona los miembros del proyecto y sus roles.</CardDescription>
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
                  Los miembros del equipo serán invitados a unirse a este proyecto.
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


'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Video, Copy, Send, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Project, Team } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { getTeamsForProject, createNotificationsForUsers } from '@/lib/firebase-services';
import { Checkbox } from '../ui/checkbox';
import { SocialIcon } from 'react-social-icons';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '../ui/alert';

interface ScheduleMeetingDialogProps {
  project: Project;
}

export function ScheduleMeetingDialog({ project }: ScheduleMeetingDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(`Reunión del Proyecto: ${project.name}`);
  const [meetLink, setMeetLink] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [inviteAll, setInviteAll] = useState(true);

  useEffect(() => {
    if (project.id) {
      const unsubscribe = getTeamsForProject(project.id, setTeams);
      return () => unsubscribe();
    }
  }, [project.id]);
  
  const handleSelectAllToggle = (checked: boolean) => {
    setInviteAll(checked);
    if(checked) {
        setSelectedTeams([]);
    }
  }
  
  const handleTeamSelectToggle = (teamId: string, checked: boolean) => {
    setInviteAll(false);
    if(checked) {
        setSelectedTeams(prev => [...prev, teamId]);
    } else {
        setSelectedTeams(prev => prev.filter(id => id !== teamId));
    }
  }

  const handleGenerateLink = () => {
    window.open('https://meet.google.com/new', '_blank');
    navigator.clipboard.readText().then(text => {
        if (text.includes('meet.google.com')) {
            setMeetLink(text);
        }
    }).catch(err => {
        console.error('Failed to read clipboard contents: ', err);
    });
    toast({
        title: "Pestaña de Google Meet abierta",
        description: "El enlace de la reunión se ha copiado. Pégalo en el campo de abajo.",
    });
  };

  const handleSchedule = async () => {
    if (!user || !meetLink) return;
    setIsLoading(true);
    try {
        let recipientIds: string[] = [];

        if(inviteAll) {
            recipientIds = project.team.map(member => member.id);
        } else {
            const selectedTeamMembers = teams
                .filter(team => selectedTeams.includes(team.id))
                .flatMap(team => team.memberIds);
            recipientIds = [...new Set(selectedTeamMembers)]; // Remove duplicates
        }
        
        recipientIds = recipientIds.filter(id => id !== user.uid);

        if (recipientIds.length > 0) {
             await createNotificationsForUsers(
                recipientIds,
                `🗓️ ${user.displayName} te ha invitado a una reunión: "${title}"`,
                meetLink
             );
        }

        toast({
            title: '¡Reunión Agendada!',
            description: "Se ha notificado a los participantes con el enlace de la reunión.",
        });
        
        setIsOpen(false);
        setMeetLink(''); // Reset link after scheduling
        
    } catch (error) {
        console.error('Error scheduling meeting:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'No se pudo agendar la reunión.',
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Video className="mr-2 h-4 w-4" />
          Agendar Reunión
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agendar Reunión con Google Meet</DialogTitle>
          <DialogDescription>
            Genera un enlace único y notifica a tu equipo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="title">Título de la Reunión</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label>Enlace de la Reunión</Label>
                <div className="space-y-3">
                    <Button variant="outline" className="w-full" onClick={handleGenerateLink}>
                        <div className="flex items-center justify-center mr-2">
                             <SocialIcon network="google_meet" style={{ height: 20, width: 20 }} />
                        </div>
                        1. Generar Enlace de Google Meet
                    </Button>
                     <Alert variant="default" className="text-xs">
                         <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            Esto abrirá una nueva pestaña. Copia la URL de la reunión y pégala a continuación.
                        </AlertDescription>
                    </Alert>
                    <div className="flex items-center gap-2">
                        <LinkIcon className="h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Pega el enlace de la reunión aquí..." 
                            value={meetLink}
                            onChange={(e) => setMeetLink(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <Label>Invitar a</Label>
                <div className="space-y-3 rounded-md border p-4">
                     <div className="flex items-center space-x-2">
                        <Checkbox
                            id="invite-all"
                            checked={inviteAll}
                            onCheckedChange={(checked) => handleSelectAllToggle(!!checked)}
                        />
                        <Label htmlFor="invite-all" className="font-semibold">Todo el Proyecto ({project.team.length} miembros)</Label>
                    </div>
                    {teams.length > 0 && <p className="text-sm text-muted-foreground">O selecciona equipos específicos:</p>}
                    <div className="space-y-2 pl-6">
                        {teams.map(team => (
                             <div key={team.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`team-${team.id}`}
                                    checked={selectedTeams.includes(team.id)}
                                    onCheckedChange={(checked) => handleTeamSelectToggle(team.id, !!checked)}
                                    disabled={inviteAll}
                                />
                                <Label htmlFor={`team-${team.id}`} className={cn("font-normal", inviteAll && "text-muted-foreground")}>{team.name} ({team.members.length} miembros)</Label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSchedule} disabled={isLoading || !meetLink || (!inviteAll && selectedTeams.length === 0)}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Send className="mr-2 h-4 w-4" />
            2. Agendar y Notificar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

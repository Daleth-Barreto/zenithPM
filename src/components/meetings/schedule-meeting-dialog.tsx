
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
import { Loader2, Video, Copy, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Project, Team } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { getTeamsForProject, createNotificationsForUsers } from '@/lib/firebase-services';
import { Checkbox } from '../ui/checkbox';
import { SocialIcon } from 'react-social-icons';
import { cn } from '@/lib/utils';

interface ScheduleMeetingDialogProps {
  project: Project;
}

export function ScheduleMeetingDialog({ project }: ScheduleMeetingDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(`Reunión del Proyecto: ${project.name}`);
  const [meetLink] = useState('https://meet.google.com/new');
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

  const handleSchedule = async () => {
    if (!user) return;
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
        
        // Remove current user from notification list
        recipientIds = recipientIds.filter(id => id !== user.uid);

        if (recipientIds.length > 0) {
             await createNotificationsForUsers(
                recipientIds,
                `🗓️ ${user.displayName} te ha invitado a una reunión: "${title}"`,
                meetLink
             );
        }

        navigator.clipboard.writeText(meetLink);
        
        toast({
            title: '¡Reunión Agendada!',
            description: (
                <div>
                    <p>Se ha notificado a los participantes. El enlace de la reunión se ha copiado a tu portapapeles.</p>
                </div>
            )
        });
        setIsOpen(false);
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
        <Button variant="outline">
          <Video className="mr-2 h-4 w-4" />
          Agendar Reunión
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agendar Reunión con Google Meet</DialogTitle>
          <DialogDescription>
            Configura los detalles y notifica a tu equipo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="title">Título de la Reunión</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label>Enlace de la Reunión</Label>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center">
                        <SocialIcon network="google_meet" style={{ height: 28, width: 28 }} />
                    </div>
                    <Input readOnly value={meetLink} className="bg-muted" />
                    <Button size="icon" variant="ghost" onClick={() => navigator.clipboard.writeText(meetLink)}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="space-y-2">
                <Label>Invitar a</Label>
                <div className="space-y-3 rounded-md border p-4">
                     <div className="flex items-center space-x-2">
                        <Checkbox
                            id="invite-all"
                            checked={inviteAll}
                            onCheckedChange={handleSelectAllToggle}
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
          <Button onClick={handleSchedule} disabled={isLoading || (!inviteAll && selectedTeams.length === 0)}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Send className="mr-2 h-4 w-4" />
            Agendar y Notificar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

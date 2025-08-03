
'use client';

import { useState } from 'react';
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
import { Loader2, PlusCircle, Users, X, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { createTeam } from '@/lib/firebase-services';
import { useToast } from '@/hooks/use-toast';
import type { Team, TeamMember } from '@/lib/types';
import { generateAvatar } from '@/lib/avatar';

interface NewTeamDialogProps {
  onTeamCreated: (team: Team) => void;
}

export function NewTeamDialog({ onTeamCreated }: NewTeamDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [memberEmail, setMemberEmail] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddMember = () => {
    if (memberEmail && !members.some(m => m.email === memberEmail)) {
        const newMember: TeamMember = {
            id: new Date().getTime().toString(), // temp ID
            email: memberEmail,
            name: memberEmail.split('@')[0],
            role: 'Miembro',
            avatarUrl: generateAvatar(memberEmail),
            initials: memberEmail.charAt(0).toUpperCase(),
            expertise: 'Sin definir',
            currentWorkload: 0,
        };
        setMembers([...members, newMember]);
        setMemberEmail('');
    }
  };

  const handleRemoveMember = (email: string) => {
    setMembers(members.filter(m => m.email !== email));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Debes iniciar sesión para crear un equipo.',
      });
      return;
    }

    if (!name.trim()) {
        toast({
            variant: 'destructive',
            title: 'Error de validación',
            description: 'El nombre del equipo no puede estar vacío.',
        });
        return;
    }

    setIsLoading(true);

    try {
      const newTeamData = { name, members };
      const newTeam = await createTeam(newTeamData, user);
      onTeamCreated(newTeam);

      toast({
        title: '¡Éxito!',
        description: `El equipo "${name}" ha sido creado.`,
      });

      // Reset form and close dialog
      setName('');
      setMembers([]);
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo crear el equipo. Por favor, inténtalo de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Equipo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Equipo</DialogTitle>
          <DialogDescription>
            Dale un nombre a tu equipo e invita a los miembros.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Equipo</Label>
            <Input
              id="name"
              placeholder="p.ej., Equipo de Diseño"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="members">Invitar Miembros</Label>
            <div className="flex gap-2">
                <Input
                    id="members"
                    type="email"
                    placeholder="miembro@example.com"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddMember();
                        }
                    }}
                />
                <Button type="button" variant="outline" onClick={handleAddMember} disabled={!memberEmail}>
                    <UserPlus className="h-4 w-4" />
                </Button>
            </div>
            <div className="space-y-2 pt-2">
                {members.map(member => (
                    <div key={member.email} className="flex items-center justify-between bg-muted p-2 rounded-md">
                        <span className="text-sm font-medium">{member.email}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveMember(member.email)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isLoading || !name}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Equipo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

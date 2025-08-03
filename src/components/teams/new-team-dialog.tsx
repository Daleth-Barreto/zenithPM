
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
import { Loader2, PlusCircle, X, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { createTeam } from '@/lib/firebase-services';
import { useToast } from '@/hooks/use-toast';
import type { Team } from '@/lib/types';

interface NewTeamDialogProps {
  projectId: string;
  onTeamCreated: (team: Team) => void;
}

export function NewTeamDialog({ projectId, onTeamCreated }: NewTeamDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [memberEmails, setMemberEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddMember = () => {
    if (currentEmail && !memberEmails.includes(currentEmail)) {
        setMemberEmails([...memberEmails, currentEmail]);
        setCurrentEmail('');
    }
  };

  const handleRemoveMember = (emailToRemove: string) => {
    setMemberEmails(memberEmails.filter(email => email !== emailToRemove));
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
      const newTeam = await createTeam(projectId, { name, memberEmails }, user);
      onTeamCreated(newTeam);

      toast({
        title: '¡Éxito!',
        description: `El equipo "${name}" ha sido creado y se han enviado las invitaciones.`,
      });

      // Reset form and close dialog
      setName('');
      setMemberEmails([]);
      setCurrentEmail('');
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
            Dale un nombre a tu equipo e invita a los miembros por correo electrónico.
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
                    value={currentEmail}
                    onChange={(e) => setCurrentEmail(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddMember();
                        }
                    }}
                />
                <Button type="button" variant="outline" onClick={handleAddMember} disabled={!currentEmail}>
                    <UserPlus className="h-4 w-4" />
                </Button>
            </div>
            <div className="space-y-2 pt-2">
                {memberEmails.map(email => (
                    <div key={email} className="flex items-center justify-between bg-muted p-2 rounded-md">
                        <span className="text-sm font-medium">{email}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveMember(email)}>
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

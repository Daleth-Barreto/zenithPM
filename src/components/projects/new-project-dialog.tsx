
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
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { createProject } from '@/lib/firebase-services';
import { useToast } from '@/hooks/use-toast';
import type { Project, TeamMember } from '@/lib/types';

interface NewProjectDialogProps {
  onProjectCreated: (project: Project) => void;
}

export function NewProjectDialog({ onProjectCreated }: NewProjectDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Debes iniciar sesión para crear un proyecto.',
      });
      return;
    }

    if (!name.trim()) {
        toast({
            variant: 'destructive',
            title: 'Error de validación',
            description: 'El nombre del proyecto no puede estar vacío.',
        });
        return;
    }

    setIsLoading(true);

    try {
      const newProjectData = {
        name,
        description,
      };
      const newProject = await createProject(newProjectData, user);
      onProjectCreated(newProject);

      toast({
        title: '¡Éxito!',
        description: `El proyecto "${name}" ha sido creado.`,
      });

      // Reset form and close dialog
      setName('');
      setDescription('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo crear el proyecto. Por favor, inténtalo de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button data-tour="new-project-btn">
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Proyecto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
          <DialogDescription>
            Completa los detalles a continuación para iniciar tu nuevo proyecto.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nombre
            </Label>
            <Input
              id="name"
              placeholder="p.ej., QuantumLeap CRM"
              className="col-span-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Descripción
            </Label>
            <Textarea
              id="description"
              placeholder="Una breve descripción del proyecto."
              className="col-span-3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Proyecto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

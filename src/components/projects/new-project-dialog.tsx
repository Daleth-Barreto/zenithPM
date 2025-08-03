
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
import { Loader2, PlusCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { createProject, createTask } from '@/lib/firebase-services';
import { useToast } from '@/hooks/use-toast';
import type { Project } from '@/lib/types';
import { breakdownProjectGoal } from '@/ai/flows/breakdown-project-goal';

interface NewProjectDialogProps {
  onProjectCreated: (project: Project) => void;
}

export function NewProjectDialog({ onProjectCreated }: NewProjectDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

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
    setLoadingMessage('Creando proyecto...');

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

      if (goal.trim()) {
        setLoadingMessage('Generando tareas con IA...');
        try {
            const result = await breakdownProjectGoal({ projectGoal: goal });
            const taskPromises = result.tasks.map((task, index) => 
                createTask(newProject.id, {
                    title: task.title,
                    description: task.description,
                    status: 'backlog',
                    priority: 'medium',
                    order: index,
                    subtasks: [],
                })
            );
            await Promise.all(taskPromises);
             toast({
                title: '¡Tareas Generadas!',
                description: 'La IA ha añadido tareas iniciales a tu proyecto.',
            });
        } catch (aiError) {
             toast({
                variant: 'destructive',
                title: 'Error de IA',
                description: 'No se pudieron generar las tareas con IA, pero el proyecto fue creado.',
            });
        }
      }

      // Reset form and close dialog
      setName('');
      setDescription('');
      setGoal('');
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
      setLoadingMessage('');
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
          <DialogDescription>
            Completa los detalles a continuación para iniciar tu nuevo proyecto.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre del Proyecto <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="p.ej., QuantumLeap CRM"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">
              Descripción Breve
            </Label>
            <Textarea
              id="description"
              placeholder="Describe en una o dos frases de qué trata el proyecto."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="goal" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Opcional: Desglose con IA</span>
            </Label>
            <Textarea
              id="goal"
              placeholder="¿Cuál es el objetivo principal de este proyecto? La IA generará una lista de tareas inicial para empezar."
              className="col-span-3"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? loadingMessage : 'Crear Proyecto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface PasswordKanbanProps {
  password?: string;
}

const passwordRequirements = [
  { id: 'length', text: 'Al menos 8 caracteres', regex: /.{8,}/ },
  { id: 'uppercase', text: 'Una letra mayúscula (A-Z)', regex: /[A-Z]/ },
  { id: 'lowercase', text: 'Una letra minúscula (a-z)', regex: /[a-z]/ },
  { id: 'number', text: 'Un número (0-9)', regex: /[0-9]/ },
  { id: 'special', text: 'Un carácter especial (!@#$..)', regex: /[^A-Za-z0-9]/ },
];

export function PasswordKanban({ password = '' }: PasswordKanbanProps) {
  
  const validationState = useMemo(() => {
    return passwordRequirements.map(req => ({
      ...req,
      met: req.regex.test(password),
    }));
  }, [password]);

  const pending = validationState.filter(req => !req.met);
  const completed = validationState.filter(req => req.met);

  return (
    <div className="w-full max-w-md space-y-8 rounded-xl bg-background/50 p-8 shadow-2xl ring-1 ring-inset ring-border/10 backdrop-blur-sm">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Crea una Contraseña Segura</h2>
        <p className="text-muted-foreground mt-2">
          Tu seguridad es nuestra prioridad. Cumple con los siguientes requisitos.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-6 min-h-[280px]">
        {/* Pending Column */}
        <div className="space-y-3 rounded-lg bg-muted/50 p-4">
          <div className="flex items-center gap-2">
            <Circle className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-muted-foreground">Pendiente</h3>
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {pending.map((req) => (
                <motion.div
                  key={req.id}
                  layoutId={req.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="flex items-center gap-2 rounded-md bg-background p-3 text-sm"
                >
                  <Circle className="h-4 w-4 flex-shrink-0 text-muted-foreground/70" />
                  <span className="text-muted-foreground">{req.text}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Completed Column */}
        <div className="space-y-3 rounded-lg bg-primary/10 p-4">
           <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-primary">Hecho</h3>
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {completed.map((req) => (
                <motion.div
                  key={req.id}
                  layoutId={req.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="flex items-center gap-2 rounded-md bg-background p-3 text-sm"
                >
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                  <span className="font-medium text-foreground">{req.text}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

    
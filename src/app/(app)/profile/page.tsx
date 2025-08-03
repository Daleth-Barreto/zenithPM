
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';
import { generateAvatar } from '@/lib/avatar';
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
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, deleteUserAccount } = useAuth();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user) {
    return null;
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteUserAccount();
      toast({
        title: 'Cuenta Eliminada',
        description: 'Tu cuenta ha sido eliminada permanentemente.',
      });
      // The auth provider will handle redirecting the user out of the app
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Error al eliminar la cuenta',
        description: error.message === 'auth/requires-recent-login'
            ? 'Esta operación requiere que inicies sesión de nuevo. Por favor, cierra sesión y vuelve a entrar para eliminar tu cuenta.'
            : 'No se pudo eliminar la cuenta. Por favor, inténtalo de nuevo.',
      });
    } finally {
        setIsDeleting(false);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const userAvatar = user.photoURL || generateAvatar(user.displayName || user.email || 'User');
  const userName = user.displayName || 'Usuario';
  const userEmail = user.email || 'No hay correo electrónico';

  return (
    <div className="p-4 md:p-8 space-y-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Mi Perfil</CardTitle>
          <CardDescription>Actualiza tu información personal y configuración.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={userAvatar} />
              <AvatarFallback className="text-2xl">{getInitials(userName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <p className="font-medium text-lg">{userName}</p>
              <p className="text-sm text-muted-foreground">Tu avatar se genera a partir de tu nombre.</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre Completo</Label>
            <Input id="fullName" defaultValue={userName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" type="email" defaultValue={userEmail} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Contraseña Actual</Label>
            <Input id="currentPassword" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva Contraseña</Label>
            <Input id="newPassword" type="password" />
          </div>
          <Button>Actualizar Perfil</Button>
        </CardContent>
      </Card>
      
      <Card className="max-w-2xl mx-auto border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de Peligro</CardTitle>
          <CardDescription>Esta acción es irreversible. Procede con precaución.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Eliminar Cuenta</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Esto eliminará permanentemente tu cuenta y todos tus datos de nuestros servidores.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting}>
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Sí, eliminar mi cuenta
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}

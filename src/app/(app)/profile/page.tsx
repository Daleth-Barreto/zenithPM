
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { getFirebaseAuthErrorMessage } from '@/lib/firebase-errors';


const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  currentPassword: z.string(),
  newPassword: z.string(),
  confirmPassword: z.string(),
}).refine(data => {
  // Si se escribe una nueva contraseña, la confirmación debe coincidir
  if (data.newPassword) {
    return data.newPassword === data.confirmPassword;
  }
  return true;
}, {
  message: "Las nuevas contraseñas no coinciden.",
  path: ["confirmPassword"],
}).refine(data => {
  // Si se escribe una nueva contraseña, la actual es requerida
  if (data.newPassword) {
    return !!data.currentPassword;
  }
  return true;
}, {
  message: "Se requiere la contraseña actual para cambiarla.",
  path: ["currentPassword"],
});


export default function ProfilePage() {
  const { user, deleteUserAccount, updateUserAccount } = useAuth();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.displayName || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  if (!user) {
    return null;
  }

  const handleUpdateProfile = async (values: z.infer<typeof profileFormSchema>) => {
    setIsUpdating(true);
    try {
      await updateUserAccount(values.fullName, values.currentPassword, values.newPassword);
      toast({
        title: 'Perfil Actualizado',
        description: 'Tus datos han sido actualizados correctamente.',
      });
      form.reset({
          ...values,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
      });
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Error al actualizar',
        description: getFirebaseAuthErrorMessage(error.code),
      });
    } finally {
        setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteUserAccount();
      toast({
        title: 'Cuenta Eliminada',
        description: 'Tu cuenta ha sido eliminada permanentemente.',
      });
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
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={userAvatar} />
              <AvatarFallback className="text-2xl">{getInitials(userName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <p className="font-medium text-lg">{userName}</p>
              <p className="text-sm text-muted-foreground">Tu avatar se genera a partir de tu nombre.</p>
            </div>
          </div>
          
           <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateProfile)} className="space-y-6">
               <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isUpdating} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" type="email" defaultValue={userEmail} disabled />
              </div>
              
              <p className="text-sm text-muted-foreground pt-4 border-t">Rellena los siguientes campos solo si quieres cambiar tu contraseña.</p>

               <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña Actual</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} disabled={isUpdating} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} disabled={isUpdating} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} disabled={isUpdating} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isUpdating}>
                 {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Actualizar Perfil
              </Button>
            </form>
           </Form>
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

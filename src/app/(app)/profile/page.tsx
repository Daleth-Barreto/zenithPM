
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';
import { generateAvatar } from '@/lib/avatar';
import { useState } from 'react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, setUser } = useAuth(); // Assuming setUser is exposed from context to update state
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  if (!user) {
    return null;
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Check file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
        toast({ variant: 'destructive', title: 'Tipo de archivo no válido', description: 'Por favor, sube un archivo PNG, JPG o GIF.' });
        return;
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        toast({ variant: 'destructive', title: 'Archivo demasiado grande', description: 'El tamaño máximo del archivo es de 10MB.' });
        return;
    }

    setIsUploading(true);
    const storageRef = ref(storage, `profile-pictures/${user.uid}`);

    try {
        await uploadBytes(storageRef, file);
        const photoURL = await getDownloadURL(storageRef);
        
        await updateProfile(user, { photoURL });
        
        // This part is tricky as the user object from useAuth might be stale.
        // A better approach would be for useAuth to listen to onIdTokenChanged
        // or to provide a function to force-refresh the user state.
        // For now, we create a new object to trigger a re-render.
        if (setUser) {
          setUser({ ...user, photoURL });
        }

        toast({ title: '¡Éxito!', description: 'Tu foto de perfil ha sido actualizada.' });

    } catch (error) {
        console.error("Error uploading file: ", error);
        toast({ variant: 'destructive', title: 'Error al subir', description: 'No se pudo actualizar la foto de perfil.' });
    } finally {
        setIsUploading(false);
    }
  };


  const userAvatar = user.photoURL || generateAvatar(user.displayName || user.email || 'User');
  const userName = user.displayName || 'Usuario';
  const userEmail = user.email || 'No hay correo electrónico';

  return (
    <div className="p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Mi Perfil</CardTitle>
          <CardDescription>Actualiza tu información personal y configuración.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={userAvatar} />
              <AvatarFallback className="text-2xl">{getInitials(userName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label htmlFor="avatar-upload">Foto de Perfil</Label>
               <div className="relative mt-1">
                 <Input 
                   id="avatar-upload"
                   type="file"
                   onChange={handleAvatarUpload}
                   disabled={isUploading}
                   className="pr-20"
                 />
                 {isUploading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />}
              </div>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF hasta 10MB.</p>
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
    </div>
  );
}

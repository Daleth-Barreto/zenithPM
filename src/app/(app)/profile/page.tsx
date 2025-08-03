
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';
import { generateAvatar } from '@/lib/avatar';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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
    </div>
  );
}

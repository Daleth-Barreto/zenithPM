import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockUsers } from '@/lib/mock-data';

export default function ProfilePage() {
  const user = mockUsers[0];

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
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="text-2xl">{user.initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label htmlFor="avatar-upload">Foto de Perfil</Label>
              <Input id="avatar-upload" type="file" className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF hasta 10MB.</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre Completo</Label>
            <Input id="fullName" defaultValue={user.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" type="email" defaultValue={user.email} disabled />
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

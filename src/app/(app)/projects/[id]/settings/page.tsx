import { getProjectById } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function ProjectSettingsPage({ params }: { params: { id: string } }) {
  const project = getProjectById(params.id);

  if (!project) {
    return <div>Proyecto no encontrado</div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Configuración General</CardTitle>
          <CardDescription>Actualiza el nombre y la descripción de tu proyecto.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">Nombre del Proyecto</Label>
            <Input id="projectName" defaultValue={project.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectDescription">Descripción del Proyecto</Label>
            <Textarea id="projectDescription" defaultValue={project.description} rows={3} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Equipo</CardTitle>
          <CardDescription>Gestiona los miembros del equipo y sus roles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {project.team.map(member => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={member.avatarUrl} />
                    <AvatarFallback>{member.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue={member.role.toLowerCase()}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Miembro</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">Invitar Miembro</h4>
            <div className="flex gap-2">
              <Input type="email" placeholder="nuevo.miembro@example.com" />
              <Button>Enviar Invitación</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Los miembros del equipo serán invitados a unirse a este proyecto por correo electrónico.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de Peligro</CardTitle>
          <CardDescription>Estas acciones son irreversibles. Procede con precaución.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">Eliminar Proyecto</Button>
        </CardContent>
      </Card>
    </div>
  );
}

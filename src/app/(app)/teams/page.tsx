
'use client';

import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NewTeamDialog } from '@/components/teams/new-team-dialog';
import { getTeamsForUser } from '@/lib/firebase-services';
import { useAuth } from '@/contexts/auth-context';
import type { Team } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TeamsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const unsubscribe = getTeamsForUser(user.uid, (teams) => {
        setTeams(teams);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const onTeamCreated = (newTeam: Team) => {
    // Listener will handle the update
    router.push(`/teams/${newTeam.id}`);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Equipos</h2>
        <div className="flex items-center space-x-2">
          <NewTeamDialog onTeamCreated={onTeamCreated} />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
             <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[120px] w-full rounded-xl" />
              <div className="space-y-2 p-6 pt-0">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : teams.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card key={team.id} className="flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback><Users /></AvatarFallback>
                        </Avatar>
                        {team.name}
                    </CardTitle>
                    <CardDescription>{team.members.length} miembros</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                     <div className="flex -space-x-2">
                        {team.members.slice(0, 5).map((member) => (
                            <Avatar key={member.id} className="border-2 border-card">
                            <AvatarImage src={member.avatarUrl} alt={member.name} />
                            <AvatarFallback>{member.initials}</AvatarFallback>
                            </Avatar>
                        ))}
                        {team.members.length > 5 && (
                            <Avatar className="border-2 border-card">
                            <AvatarFallback>+{team.members.length - 5}</AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                        <Link href={`/teams/${team.id}`}>Gestionar Equipo</Link>
                    </Button>
                </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-8 sm:mt-16 py-16 sm:py-24">
          <div className="flex flex-col items-center gap-2 text-center p-4">
            <Users className="h-16 w-16 text-muted-foreground" />
            <h3 className="text-2xl font-bold tracking-tight">Aún no hay equipos</h3>
            <p className="text-sm text-muted-foreground">
              Comienza creando tu primer equipo para organizar a tus colaboradores.
            </p>
            <div className="mt-4">
              <NewTeamDialog onTeamCreated={onTeamCreated} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

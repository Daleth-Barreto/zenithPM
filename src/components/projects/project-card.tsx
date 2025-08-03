import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { Project } from '@/lib/types';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl">
      <CardHeader className="p-0">
        <div className="relative h-40 w-full">
          <Image
            src={project.imageUrl}
            alt={project.name}
            layout="fill"
            objectFit="cover"
            data-ai-hint="abstract background"
          />
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <CardTitle className="mb-2 text-xl">{project.name}</CardTitle>
        <CardDescription className="line-clamp-2">{project.description}</CardDescription>
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-semibold">{project.progress}%</span>
          </div>
          <Progress value={project.progress} aria-label={`${project.progress}% complete`} />
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0 flex justify-between items-center">
        <div className="flex -space-x-2">
          {project.team.slice(0, 4).map((member) => (
            <Avatar key={member.id} className="border-2 border-card">
              <AvatarImage src={member.avatarUrl} alt={member.name} />
              <AvatarFallback>{member.initials}</AvatarFallback>
            </Avatar>
          ))}
          {project.team.length > 4 && (
            <Avatar className="border-2 border-card">
              <AvatarFallback>+{project.team.length - 4}</AvatarFallback>
            </Avatar>
          )}
        </div>
        <Button asChild>
          <Link href={`/projects/${project.id}/board`}>View Project</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

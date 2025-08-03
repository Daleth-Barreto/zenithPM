'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import {
  ArrowRight,
  LayoutGrid,
  Users,
  BrainCircuit,
  BarChart,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function ProjectManagementIllustration(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 400"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.8" />
        </linearGradient>
        <style>
          {`
            @keyframes float {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
              100% { transform: translateY(0px); }
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0px); }
            }
            .floating { animation: float 6s ease-in-out infinite; }
            .fade-in { animation: fadeIn 0.5s ease-out forwards; }
          `}
        </style>
      </defs>

      <g transform="translate(400 200)">
        <rect
          x="-350"
          y="-180"
          width="320"
          height="180"
          rx="12"
          fill="hsl(var(--card))"
          stroke="hsl(var(--border))"
          strokeWidth="2"
          className="fade-in"
          style={{ animationDelay: '0.1s' }}
        />
        <text x="-330" y="-155" fontFamily="Inter, sans-serif" fontSize="16" fontWeight="bold" fill="hsl(var(--foreground))">
          Tareas Pendientes
        </text>
        <rect x="-330" y="-135" width="280" height="30" rx="4" fill="hsl(var(--background))" />
        <text x="-325" y="-115" fontFamily="Inter, sans-serif" fontSize="12" fill="hsl(var(--foreground))">Diseño de UI/UX</text>
        <rect x="-330" y="-95" width="280" height="30" rx="4" fill="hsl(var(--background))" />
        <text x="-325" y="-75" fontFamily="Inter, sans-serif" fontSize="12" fill="hsl(var(--foreground))">Desarrollo API</text>

        <rect
          x="30"
          y="-150"
          width="320"
          height="280"
          rx="12"
          fill="hsl(var(--card))"
          stroke="hsl(var(--border))"
          strokeWidth="2"
          className="fade-in"
          style={{ animationDelay: '0.3s' }}
        />
        <text x="50" y="-125" fontFamily="Inter, sans-serif" fontSize="16" fontWeight="bold" fill="hsl(var(--foreground))">
          Progreso del Equipo
        </text>
        <path d="M 60 100 C 120 -20, 200 150, 320 20" stroke="url(#grad1)" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="60" cy="100" r="6" fill="hsl(var(--primary))" className="floating" style={{ animationDelay: '0s' }} />
        <circle cx="180" cy="50" r="6" fill="hsl(var(--accent))" className="floating" style={{ animationDelay: '1s' }} />
        <circle cx="320" cy="20" r="6" fill="hsl(var(--primary))" className="floating" style={{ animationDelay: '2s' }} />

        <g className="fade-in" style={{ animationDelay: '0.5s' }}>
          <circle cx="-150" cy="100" r="30" fill="hsl(var(--primary))" className="floating" style={{ animationDelay: '0.5s' }} />
          <text x="-162" y="105" fontFamily="Inter, sans-serif" fontSize="20" fill="hsl(var(--primary-foreground))">75%</text>
        </g>

        <g className="fade-in" style={{ animationDelay: '0.7s' }}>
          <path d="M -50 50 L -20 80 L 10 50" fill="none" stroke="hsl(var(--accent))" strokeWidth="4" />
          <circle cx="-20" cy="80" r="4" fill="hsl(var(--accent))" />
        </g>
      </g>
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">ZenithPM</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Registrarse Gratis</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto py-20 md:py-32 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary-foreground">
              Eleva tu Productividad a la Cima
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
              ZenithPM es la plataforma todo-en-uno que transforma el caos en claridad. Colabora, gestiona proyectos y organiza tareas sin esfuerzo.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/signup">
                Comienza Ahora <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
          <div className="relative mt-16 h-64 md:h-96 -mx-4">
            <ProjectManagementIllustration />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 md:px-8 bg-muted/50">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Todo lo que necesitas para triunfar</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                Desde tableros visuales hasta resúmenes inteligentes, ZenithPM tiene las herramientas para impulsar tu éxito.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center p-6 border-transparent shadow-none hover:bg-card hover:border-border transition-colors">
                <div className="inline-block p-4 bg-primary/10 text-primary rounded-lg mb-4">
                  <LayoutGrid className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Tableros Kanban Flexibles</h3>
                <p className="text-muted-foreground">
                  Visualiza tu flujo de trabajo con tableros Kanban. Arrastra y suelta tareas para un seguimiento intuitivo del progreso.
                </p>
              </Card>
              <Card className="text-center p-6 border-transparent shadow-none hover:bg-card hover:border-border transition-colors">
                <div className="inline-block p-4 bg-primary/10 text-primary rounded-lg mb-4">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Colaboración Simplificada</h3>
                <p className="text-muted-foreground">
                  Mantén a tu equipo en sintonía. Asigna tareas, comparte archivos y comunícate en un solo lugar.
                </p>
              </Card>
              <Card className="text-center p-6 border-transparent shadow-none hover:bg-card hover:border-border transition-colors">
                <div className="inline-block p-4 bg-primary/10 text-primary rounded-lg mb-4">
                  <BrainCircuit className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Resúmenes con IA</h3>
                <p className="text-muted-foreground">
                  Transforma largas notas de reuniones en resúmenes claros y accionables al instante con el poder de la IA.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4 md:px-8">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">Comienza en Minutos</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                Alcanzar tus metas nunca ha sido tan fácil. Sigue estos simples pasos.
              </p>
            </div>
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2 hidden md:block" />
              <div className="relative text-center">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold border-4 border-background">1</div>
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-accent mt-8" />
                <h3 className="text-xl font-semibold mb-2">Crea tu Proyecto</h3>
                <p className="text-muted-foreground">
                  Define tus objetivos y estructura tu proyecto en segundos.
                </p>
              </div>
              <div className="relative text-center">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold border-4 border-background">2</div>
                <BarChart className="w-12 h-12 mx-auto mb-4 text-accent mt-8" />
                <h3 className="text-xl font-semibold mb-2">Organiza y Asigna</h3>
                <p className="text-muted-foreground">
                  Añade tareas, establece prioridades y asigna responsabilidades a tu equipo.
                </p>
              </div>
              <div className="relative text-center">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold border-4 border-background">3</div>
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-accent mt-8" />
                <h3 className="text-xl font-semibold mb-2">Alcanza tus Metas</h3>
                <p className="text-muted-foreground">
                  Observa el progreso en tiempo real y celebra los logros de tu equipo.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-20 px-4 md:px-8 bg-muted/50">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Amado por Equipos Productivos</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-6">
                  <p className="mb-4">"ZenithPM ha revolucionado nuestra forma de trabajar. La claridad que nos da sobre nuestros proyectos es increíble. ¡Hemos aumentado nuestra eficiencia en un 30%!"</p>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src="https://placehold.co/100x100/408080/FFFFFF" />
                      <AvatarFallback>CJ</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">Carla Jiménez</p>
                      <p className="text-sm text-muted-foreground">Directora de Proyecto, Innovatech</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="mb-4">"La función de resúmenes con IA es mágica. Ahorramos horas cada semana en la redacción de actas de reuniones. Es una herramienta indispensable para nosotros."</p>
                   <div className="flex items-center gap-4">
                    <Avatar>
                       <AvatarImage src="https://placehold.co/100x100/E94F37/FFFFFF" />
                       <AvatarFallback>MR</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">Marcos Rivera</p>
                      <p className="text-sm text-muted-foreground">Líder de Equipo, Soluciones Digitales</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 md:px-8">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold">¿Listo para alcanzar tu cima?</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Únete a miles de equipos que ya están logrando más con menos estrés. Tu próximo gran proyecto comienza aquí.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/signup">
                Comienza Gratis, Sin Tarjeta de Crédito <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="p-6 border-t bg-muted/50">
        <div className="container mx-auto flex justify-between items-center text-sm text-muted-foreground">
            <span>© {new Date().getFullYear()} ZenithPM. Todos los derechos reservados.</span>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-foreground">Términos</Link>
              <Link href="#" className="hover:text-foreground">Privacidad</Link>
            </div>
        </div>
      </footer>
    </div>
  );
}

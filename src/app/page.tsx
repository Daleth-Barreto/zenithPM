'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ArrowRight,
  LayoutGrid,
  Users,
  BrainCircuit,
  BarChart,
  CheckCircle,
  TrendingUp,
  HelpCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
             @keyframes float-alt {
              0% { transform: translateY(0px); }
              50% { transform: translateY(8px); }
              100% { translateY(0px); }
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: scale(0.95) translateY(10px); }
              to { opacity: 1; transform: scale(1) translateY(0px); }
            }
            .floating { animation: float 6s ease-in-out infinite; }
            .floating-alt { animation: float-alt 7s ease-in-out infinite; }
            .fade-in { animation: fadeIn 0.8s ease-out forwards; }
          `}
        </style>
      </defs>

      {/* <!-- Background abstract shapes --> */}
      <circle cx="150" cy="250" r="150" fill="hsl(var(--primary))" fillOpacity="0.05" />
      <circle cx="650" cy="150" r="200" fill="hsl(var(--accent))" fillOpacity="0.05" />

      {/* <!-- Central Flow Line --> */}
      <path
        d="M 100 200 C 250 100, 350 300, 500 200 S 650 100, 700 150"
        stroke="hsl(var(--border))"
        strokeWidth="2"
        strokeDasharray="5, 5"
        fill="none"
        className="fade-in"
        style={{ animationDelay: '0.2s' }}
      />

      {/* <!-- Floating Node 1: Idea/Task --> */}
      <g className="floating fade-in" style={{ animationDelay: '0.4s' }}>
        <rect
          x="80"
          y="180"
          width="100"
          height="60"
          rx="8"
          fill="hsl(var(--card))"
          stroke="hsl(var(--border))"
          strokeWidth="1.5"
        />
        <path d="M 100 200 L 140 200" stroke="hsl(var(--muted-foreground))" strokeWidth="2" />
        <path d="M 100 215 L 125 215" stroke="hsl(var(--muted-foreground))" strokeWidth="2" />
      </g>
      
      {/* <!-- Floating Node 2: In Progress --> */}
      <g className="floating fade-in" style={{ animationDelay: '0.7s', animationDuration: '7s' }}>
        <circle cx="300" cy="150" r="40" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1.5" />
        <circle cx="300" cy="150" r="30" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeDasharray="70 118" strokeLinecap="round" transform="rotate(-90 300 150)"/>
      </g>
      
      {/* <!-- Floating Node 3: Collaboration --> */}
      <g className="floating-alt fade-in" style={{ animationDelay: '1s', animationDuration: '5s' }}>
        <path d="M 480 230 L 520 270 L 480 270 Z" fill="hsl(var(--accent))" fillOpacity="0.2" />
        <circle cx="500" cy="250" r="30" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1.5" />
        <circle cx="493" cy="245" r="5" fill="hsl(var(--accent))" />
        <circle cx="507" cy="245" r="5" fill="hsl(var(--accent))" />
        <path d="M 495 258 A 10 10 0 0 0 505 258" stroke="hsl(var(--accent))" strokeWidth="1.5" fill="none" />
      </g>

      {/* <!-- Floating Node 4: Completion/Goal --> */}
      <g className="floating fade-in" style={{ animationDelay: '1.3s', animationDuration: '8s' }}>
        <rect x="670" y="120" width="60" height="60" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1.5" />
        <path d="M 685 150 L 695 160 L 715 140" stroke="hsl(var(--primary))" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      
      {/* <!-- Additional floating elements --> */}
      <g className="floating-alt fade-in" style={{ animationDelay: '1.6s', animationDuration: '9s' }}>
         <circle cx="200" cy="80" r="15" fill="hsl(var(--accent))" fillOpacity="0.3" />
      </g>
      <g className="floating fade-in" style={{ animationDelay: '1.9s', animationDuration: '6s' }}>
         <rect x="580" y="280" width="40" height="40" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1.5" transform="rotate(45 600 300)" />
      </g>
       <g className="floating-alt fade-in" style={{ animationDelay: '2.2s', animationDuration: '8s' }}>
         <path d="M 380 320 L 420 320" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeDasharray="2, 4" />
      </g>
    </svg>
  );
}


export default function LandingPage() {
  return (
    <>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <div className="flex flex-col min-h-screen bg-background text-foreground font-body antialiased">
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
          
          {/* FAQ Section */}
          <section className="py-20 px-4 md:px-8 bg-muted/50">
            <div className="container mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold">Preguntas Frecuentes</h2>
                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                  ¿Tienes preguntas? Tenemos respuestas. Aquí están algunas de las más comunes.
                </p>
              </div>
              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>¿ZenithPM es adecuado para equipos pequeños?</AccordionTrigger>
                    <AccordionContent>
                      ¡Absolutamente! ZenithPM es escalable y perfecto tanto para freelancers como para equipos pequeños y grandes empresas. Puedes empezar con un plan gratuito y crecer a medida que tu equipo lo necesite.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>¿Qué integraciones soporta ZenithPM?</AccordionTrigger>
                    <AccordionContent>
                      Actualmente estamos trabajando en integraciones con herramientas populares como Slack, GitHub, Google Drive y más. Nuestro objetivo es que ZenithPM se convierta en el centro de tu flujo de trabajo.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>¿Mis datos están seguros?</AccordionTrigger>
                    <AccordionContent>
                      La seguridad es nuestra máxima prioridad. Utilizamos encriptación de extremo a extremo, copias de seguridad regulares y cumplimos con los estándares más altos de la industria para garantizar que tus datos estén siempre protegidos.
                    </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="item-4">
                    <AccordionTrigger>¿Cómo funciona la facturación?</AccordionTrigger>
                    <AccordionContent>
                      Ofrecemos planes mensuales y anuales flexibles. Puedes cambiar de plan, actualizar o cancelar tu suscripción en cualquier momento desde el panel de configuración de tu cuenta. El plan anual ofrece un descuento significativo.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-5">
                    <AccordionTrigger>¿Puedo importar datos de otras herramientas?</AccordionTrigger>
                    <AccordionContent>
                      Sí, estamos desarrollando herramientas de importación para que puedas traer fácilmente tus proyectos y tareas desde otras plataformas como Trello, Asana y Jira. Queremos que tu transición a ZenithPM sea lo más fluida posible.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
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
                <Link href="/terms-and-privacy" className="hover:text-foreground">Términos y Privacidad</Link>
              </div>
          </div>
        </footer>
      </div>
    </>
  );
}

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex items-center justify-between p-4 px-6 border-b">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-semibold">ZenithPM</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Registrarse</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative h-[600px] flex items-center justify-center text-center text-white">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://placehold.co/1920x1080/000000/FFFFFF?text=.')",
            }}
            data-ai-hint="office collaboration"
          >
            <div className="absolute inset-0 bg-black/50" />
          </div>
          <div className="relative z-10 p-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tighter">
              Alcanza Nuevos Picos de Productividad
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-foreground/80">
              Colabora, gestiona proyectos y organiza tareas como nunca antes. ZenithPM es tu centro de mando todo en uno para el éxito del proyecto.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/signup">
                Comenzar Gratis <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </section>

        <section id="features" className="py-20 px-4 md:px-8">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Características Potentes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 border rounded-lg shadow-sm">
                <Logo className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Gestión de Tareas Kanban</h3>
                <p className="text-muted-foreground">
                  Visualiza tu flujo de trabajo con tableros Kanban intuitivos. Arrastra y suelta tareas entre columnas para un seguimiento fácil del progreso.
                </p>
              </div>
              <div className="text-center p-6 border rounded-lg shadow-sm">
                <Logo className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Colaboración en Equipo</h3>
                <p className="text-muted-foreground">
                  Mantén a tu equipo alineado. Asigna tareas, comparte archivos y comunícate dentro del contexto de tu proyecto.
                </p>
              </div>
              <div className="text-center p-6 border rounded-lg shadow-sm">
                <Logo className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Resúmenes con IA</h3>
                <p className="text-muted-foreground">
                  Transforma largas notas de reuniones en resúmenes concisos y accionables con el poder de la IA.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="p-6 border-t text-center text-muted-foreground">
        © {new Date().getFullYear()} ZenithPM. Todos los derechos reservados.
      </footer>
    </div>
  );
}

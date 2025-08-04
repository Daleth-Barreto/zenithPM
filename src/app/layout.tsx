
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from 'next-themes'

export const metadata: Metadata = {
  title: {
    default: 'ZenithPM | Eleva tu Productividad a la Cima',
    template: '%s | ZenithPM',
  },
  description: 'ZenithPM es la plataforma todo-en-uno que transforma el caos en claridad. Colabora, gestiona proyectos con tableros kanban y organiza tareas sin esfuerzo.',
  keywords: ['gestión de proyectos', 'kanban', 'colaboración en equipo', 'productividad', 'software de gestión', 'herramienta de proyectos', 'ZenithPM'],
  authors: [{ name: 'ZenithPM Team' }],
  creator: 'ZenithPM',
  publisher: 'ZenithPM',
  robots: 'index, follow',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    url: 'https://zenithpm.vercel.app/',
    title: 'ZenithPM | Eleva tu Productividad a la Cima',
    description: 'Colabora, gestiona proyectos con tableros kanban y organiza tareas sin esfuerzo.',
    siteName: 'ZenithPM',
    images: [{
      url: 'https://zenithpm.vercel.app/og-image.png', // You should create this image
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZenithPM | Eleva tu Productividad a la Cima',
    description: 'Colabora, gestiona proyectos con tableros kanban y organiza tareas sin esfuerzo.',
    images: ['https://zenithpm.vercel.app/twitter-image.png'], // You should create this image
    creator: '@zenithpm',
  },
   icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e293b" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

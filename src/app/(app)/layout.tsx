
'use client';

import { SidebarProvider } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AppTour } from '@/components/app-tour';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Check if the tour has been completed
    const tourCompleted = localStorage.getItem('zenith_tour_completed');
    if (user && !tourCompleted) {
      setIsTourOpen(true);
    }
  }, [user]);

  const handleTourComplete = () => {
    localStorage.setItem('zenith_tour_completed', 'true');
    setIsTourOpen(false);
  };


  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background text-foreground">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <AppHeader />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
      <AppTour isTourOpen={isTourOpen} onTourComplete={handleTourComplete} />
    </SidebarProvider>
  );
}

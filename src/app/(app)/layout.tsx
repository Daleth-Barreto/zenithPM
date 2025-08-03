
'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
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
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <AppHeader />
        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </SidebarInset>
      <AppTour isTourOpen={isTourOpen} onTourComplete={handleTourComplete} />
    </SidebarProvider>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { PageTransition } from '@/components/PageTransition';
import { getSession, subscribeToSession, type Session } from '@/lib/session';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSessionState] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    const sync = () => setSessionState(getSession());
    sync();
    return subscribeToSession(sync);
  }, []);

  const isLogin = pathname === '/login';

  useEffect(() => {
    if (session === null && !isLogin) router.replace('/login');
  }, [session, isLogin, router]);

  if (isLogin) return <main className="flex-1 overflow-y-auto">{children}</main>;
  if (!session) return null;

  return (
    <>
      <Sidebar session={session} />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-success/10 rounded-full blur-[120px] pointer-events-none" />
        <Header />
        <main className="flex-1 overflow-y-auto p-6 z-10">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </>
  );
}

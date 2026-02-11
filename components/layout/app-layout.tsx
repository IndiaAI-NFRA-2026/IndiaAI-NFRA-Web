/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/ui/header';
import { Breadcrumb, BreadcrumbProvider } from '@/components/breadcrumb';
import { Spinner } from '@/components/ui/spinner';
import { getAccessToken } from '@/lib/utils/auth';
import { cn } from '@/lib/utils';
import { useMe } from '@/lib/query/use-auth';
import { USER_ROLE } from '@/enums/auth';
import { hasAccessToPage } from '@/lib/auth/rbac';
import { ROUTERS } from '@/constants/routers';

interface AppLayoutProps {
  children: ReactNode;
  isContentScrollable?: boolean;
  isBreadcrumbVisible?: boolean;
}

export function AppLayout({ children, isContentScrollable = false, isBreadcrumbVisible = true }: AppLayoutProps) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const { data: user, isPending } = useMe();

  useEffect(() => {
    if (!getAccessToken()) {
      router.push('/login');
      return;
    }

    if (isPending) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (!hasAccessToPage(user.role as USER_ROLE, window.location.pathname)) {
      router.push(ROUTERS.FORBIDDEN);
      return;
    }
    setIsReady(true);
  }, [router, user, isPending]);

  if (!isReady) {
    return (
      <div className="bg-muted/40 flex h-screen items-center justify-center">
        <Spinner className="size-10 animate-spin text-(--color-sidebar-ring)" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="max-lg:hidden">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main
          className={cn(
            'bg-muted/40 flex flex-1 flex-col p-4 pt-0! max-md:p-0 md:p-6',
            isContentScrollable ? 'overflow-y-auto pb-0!' : 'overflow-hidden'
          )}
        >
          <BreadcrumbProvider>
            {isBreadcrumbVisible ? <Breadcrumb /> : <div className="h-4" />}
            <div className={cn('flex flex-1 flex-col', isContentScrollable ? 'overflow-y-auto' : 'overflow-hidden')}>{children}</div>
          </BreadcrumbProvider>
        </main>
      </div>
    </div>
  );
}

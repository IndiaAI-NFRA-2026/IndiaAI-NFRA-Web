'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/lib/utils/auth';
import { ROUTERS } from '@/constants/routers';
import { Spinner } from '@/components/ui/spinner';
import { getDefaultRouteForUser } from '@/lib/auth/rbac';
import { USER_ROLE } from '@/enums/auth';
import { useMe } from '@/lib/query/use-auth';

export default function Home() {
  const router = useRouter();
  const { data: user } = useMe();

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      router.push(getDefaultRouteForUser(user?.role as USER_ROLE));
    } else {
      router.push(ROUTERS.LOGIN);
    }
  }, [router, user]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full flex-col items-center justify-between bg-white px-16 py-32 sm:items-start dark:bg-black">
        <Spinner className="size-10 animate-spin text-(--color-sidebar-ring)" />
      </main>
    </div>
  );
}

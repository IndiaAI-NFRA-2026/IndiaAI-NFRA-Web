'use client';

import Card from '@/components/card';
import { AppLayout } from '@/components/layout/app-layout';
import { Heading } from '@/components/heading';
import { BanIcon } from 'lucide-react';
import { Button } from '@/components/button';
import { ROUTERS } from '@/constants/routers';
import { useRouter } from 'next/navigation';

const ForbiddenContent = () => {
  const router = useRouter();
  return (
    <Card
      header={<Heading title="Forbidden" subTitle="You are not authorized to access this page." />}
      containerStyle="flex flex-1 flex-col overflow-hidden"
      contentStyle="flex flex-1 flex-col items-center justify-center gap-4"
    >
      <div className="flex flex-col items-center justify-center gap-4 p-6">
        <BanIcon className="size-10 text-red-500" />
        <p className="text-muted-foreground text-sm">You are not authorized to access this page.</p>
        <Button title="Back to home" onClick={() => router.push(ROUTERS.HOME)} />
      </div>
    </Card>
  );
};

export default function ForbiddenPage() {
  return (
    <AppLayout isBreadcrumbVisible={false}>
      <ForbiddenContent />
    </AppLayout>
  );
}

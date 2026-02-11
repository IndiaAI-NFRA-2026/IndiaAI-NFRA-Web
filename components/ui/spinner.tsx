'use client';

import { Loader2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';

function Spinner({ className, ...props }: Readonly<React.ComponentProps<'output'>>) {
  return (
    <output className={cn('inline-flex size-4 shrink-0 items-center justify-center', className)} {...props}>
      <Loader2Icon className="size-8 shrink-0 origin-center animate-spin" aria-label="Loading" />
    </output>
  );
}

export { Spinner };

import * as React from 'react';

import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'border-input hover:border-filters-border/80 focus:border-filters-border/80 flex min-h-[80px] w-full rounded-md border bg-(--color-background-color) px-4 py-3 text-sm transition-all duration-200 placeholder:text-(--color-filters-placeholder) focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };

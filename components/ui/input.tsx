import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'> & { icon?: React.ReactNode }>(
  ({ className, type, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && <div className="absolute top-1/2 left-3 -translate-y-1/2">{icon}</div>}
        <input
          type={type}
          className={cn(
            'border-input file:text-foreground flex h-10 w-full rounded border border-(--color-filters-border) bg-(--color-background-color) px-4 py-2.5 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--color-filters-placeholder)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            'hover:border-filters-border/80 focus:border-filters-border/80 focus:outline-none',
            icon && 'pl-8',
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };

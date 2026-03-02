import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'> & { icon?: React.ReactNode; error?: string }>(
  ({ className, type, icon, error, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && <div className="absolute top-[12px] left-2">{icon}</div>}
        <input
          type={type}
          className={cn(
            'file:text-foreground flex h-[37px] w-full rounded border border-[#0000000F] bg-(--color-background-color) px-3 py-2.5 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--color-filters-placeholder)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            'focus:border-primary/50 hover:border-[#0000000F] focus:outline-none',
            error && 'border-destructive/50',
            icon && 'pl-8',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <div className="mt-[3px]">
            <p className="text-destructive text-[12px]">{error}</p>
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };

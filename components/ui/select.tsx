'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { cn } from '@/lib/utils';

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'border-input ring-offset-background data-placeholder:text-muted-foreground/60 hover:border-input/80 disabled:hover:border-input disabled:cursor-point flex h-10 w-full items-center justify-between rounded border bg-(--color-background-color) px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none disabled:opacity-50 [&>span]:line-clamp-1 [&>span]:min-w-0 [&>span]:flex-1 [&>span]:truncate [&>span]:text-left',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0 opacity-60 transition-transform duration-200 data-[state=open]:rotate-180" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn('text-muted-foreground/60 cursor-point flex items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn('text-muted-foreground/60 cursor-point flex items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'cursor-point bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-100 max-h-[--radix-select-content-available-height] max-w-[--radix-select-trigger-width] min-w-32 origin-[--radix-select-content-transform-origin] overflow-visible rounded border shadow-lg',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'w-full max-w-full p-1.5',
          position === 'popper' && 'h-(--radix-select-trigger-height) w-full max-w-40 min-w-(--radix-select-trigger-width)'
        )}
        style={{ overflowY: 'auto', overflowX: 'visible', maxHeight: 'var(--radix-select-content-available-height)' }}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('text-muted-foreground py-2 pr-2 pl-8 text-xs font-semibold tracking-wider uppercase', className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  // Extract text from children for tooltip
  const getTextContent = (node: React.ReactNode): string => {
    if (typeof node === 'string' || typeof node === 'number') {
      return String(node);
    }
    if (React.isValidElement(node)) {
      const props = node.props as { children?: React.ReactNode };
      if (props.children) {
        return getTextContent(props.children);
      }
    }
    if (Array.isArray(node)) {
      return node.map(getTextContent).join('');
    }
    return '';
  };

  const tooltipText = getTextContent(children);

  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        'focus:bg-accent focus:text-accent-foreground relative flex w-full max-w-full cursor-pointer items-center overflow-visible rounded-md py-2.5 pr-3 pl-9 text-left text-sm transition-colors duration-150 outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-[#f9fafb]',
        className
      )}
      {...props}
    >
      <span className="absolute left-2.5 z-10 flex h-4 w-4 flex-shrink-0 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4 text-(--color-button-background)" />
        </SelectPrimitive.ItemIndicator>
      </span>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="block min-w-0 flex-1 truncate pr-2">
              <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
            </span>
          </TooltipTrigger>
          {tooltipText && (
            <TooltipContent side="bottom" className="z-[9999] max-w-xs" sideOffset={4}>
              <p className="break-words">{tooltipText}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className={cn('bg-muted -mx-1 my-1.5 h-px', className)} {...props} />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};

'use client';

import * as React from 'react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Loader2Icon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { TooltipContentProps } from '@radix-ui/react-tooltip';

export interface ButtonProps {
  title?: string;
  onClick: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  type?: 'default' | 'outline' | 'secondary' | 'primary' | 'link' | 'text' | 'danger';
  size?: 'default' | 'sm' | 'md' | 'lg' | 'xl';
  tooltip?: string;
  tooltipSide?: TooltipContentProps['side'];
}

const Button = ({
  title,
  onClick,
  isLoading,
  disabled,
  className,
  icon,
  iconPosition = 'left',
  type = 'default',
  size = 'default',
  tooltip,
  tooltipSide = 'top',
}: ButtonProps) => {
  const typeClass = useMemo(() => {
    switch (type) {
      case 'outline':
        return 'bg-transparent text-primary-color border border-primary-color hover:opacity-80';
      case 'secondary':
        return 'bg-transparent text-background-navy hover:bg-background-navy/10';
      case 'primary':
        return 'bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90';
      case 'link':
        return 'text-background-navy hover:underline';
      case 'text':
        return 'bg-transparent text-background-navy hover:opacity-80';
      case 'danger':
        return 'bg-destructive text-white hover:bg-destructive/90';
      default:
        return 'bg-background-navy text-white hover:bg-background-navy/90';
    }
  }, [type]);

  const sizeClass = useMemo(() => {
    switch (size) {
      case 'sm':
        return 'px-[10px] py-[4px] text-[12px] leading-[22px] rounded-[4px]';
      case 'lg':
        return 'px-[10px] py-[4px] text-[14px] leading-[24px] rounded-[4px]';
      case 'xl':
        return 'px-[10px] py-[6px] text-[16px] leading-[26px] rounded-[4px]';
      default:
        return 'px-[10px] py-[4px] text-[14px] leading-[22px] rounded-[4px]';
    }
  }, [size]);

  const buttonContent = (
    <button
      disabled={isLoading || disabled}
      className={cn(
        'flex cursor-pointer flex-nowrap items-center gap-[8px] disabled:cursor-not-allowed disabled:opacity-70',
        className,
        typeClass,
        sizeClass
      )}
      onClick={(e) => !disabled && onClick(e)}
    >
      {icon && iconPosition === 'left' && icon}
      {isLoading && <Loader2Icon aria-label="Loading" className="size-4 animate-spin" />}
      {title && <span className="whitespace-nowrap">{title}</span>}
      {icon && iconPosition === 'right' && icon}
    </button>
  );

  if (tooltip) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
          <TooltipContent
            side={tooltipSide}
            className="max-w-[250px] rounded-[4px] bg-white p-[6px_8px] text-center text-[#000000D9] shadow-[0px_1px_4px_0px_#0C0C0D0D]"
          >
            <p className="text-[12px] wrap-break-word">{tooltip}</p>
            <TooltipPrimitive.Arrow className="fill-gray-200" />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return buttonContent;
};

export { Button };

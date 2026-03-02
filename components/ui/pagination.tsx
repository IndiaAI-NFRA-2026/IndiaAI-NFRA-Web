'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ButtonProps, buttonVariants } from '@/components/ui/button';

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav role="navigation" aria-label="Pagination" className={cn('mx-auto flex w-full justify-center', className)} {...props} />
);
Pagination.displayName = 'Pagination';

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(({ className, ...props }, ref) => (
  <ul ref={ref} className={cn('flex flex-row items-center gap-2', className)} {...props} />
));
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
));
PaginationItem.displayName = 'PaginationItem';

type PaginationLinkProps = {
  isActive?: boolean;
  children?: React.ReactNode;
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<'a'>;

const PaginationLink = ({ className, isActive, size = 'icon', children, ...props }: PaginationLinkProps) => (
  <a
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      'h-8 w-8',
      buttonVariants({
        variant: isActive ? 'outline' : 'ghost',
        size,
      }),
      isActive &&
        'border-(--color-pagination-item-border-active) bg-(--color-pagination-item-border-active) text-(--color-pagination-item-text-color)',
      className
    )}
    {...props}
  >
    {children}
  </a>
);
PaginationLink.displayName = 'PaginationLink';

const PaginationPrevious = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => {
  const { t } = useTranslation();
  return (
    <PaginationLink aria-label="Go to previous page" size="default" className={cn('gap-1 pl-2.5', className)} {...props}>
      <ChevronLeft className="h-4 w-4" />
      <span>{t('button.previous')}</span>
    </PaginationLink>
  );
};
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => {
  const { t } = useTranslation();
  return (
    <PaginationLink aria-label="Go to next page" size="default" className={cn('gap-1 pr-2.5', className)} {...props}>
      <span>{t('button.next')}</span>
      <ChevronRight className="h-4 w-4" />
    </PaginationLink>
  );
};
PaginationNext.displayName = 'PaginationNext';

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn('flex h-8 w-8 items-center justify-center text-(--color-pagination-item-text-color-gray)', className)}
    {...props}
  >
    <MoreHorizontal className={cn('h-4 w-4', 'text-(--color-pagination-item-text-color-gray)')} />
    <span className={cn('sr-only', 'text-(--color-pagination-item-text-color-gray)')}>More pages</span>
  </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

export { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious };

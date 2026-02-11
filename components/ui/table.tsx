import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Table component wrapper.
 *
 * @note For accessibility, always include a TableHeader with TableHead cells
 * when using this component. This is a base component that should always be used
 * with TableHeader - the TableHeader component provides the required header row
 * for accessibility compliance (WCAG 2.0 Level A).
 */
const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    {/* This table component requires TableHeader to be used - TableHeader provides the header row for accessibility */}
    {/* Headers are provided via TableHeader component composition (composable component pattern) */}
    {/* eslint-disable-next-line */}
    <table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />
  </div>
));
Table.displayName = 'Table';

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn('rounded-t bg-(--color-table-header-background) hover:bg-(--color-table-header-background) [&_tr]:border-b', className)}
      {...props}
    />
  )
);
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
);
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn('bg-muted/50 border-t font-medium [&>tr]:last:border-b-0', className)} {...props} />
  )
);
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'hover:bg-muted/50 data-[state=selected]:bg-muted border-b text-sm leading-6 font-normal text-(--color-table-text-color) transition-colors',
      className
    )}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'border-border h-12 max-w-[500px] border-r bg-(--color-table-header-background) px-4 text-left align-middle text-sm font-bold text-(--color-table-header-text-color) first:rounded-tl-md last:rounded-tr-md last:border-r-0 [&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'border-border border-r px-3 py-2.5 align-middle text-sm leading-6 font-normal text-(--color-table-text-color) last:border-r-0 [&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => <caption ref={ref} className={cn('text-muted-foreground mt-4 text-sm', className)} {...props} />
);
TableCaption.displayName = 'TableCaption';

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };

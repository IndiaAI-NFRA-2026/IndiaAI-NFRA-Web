'use client';

import * as React from 'react';
import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSize?: number;
  pageIndex?: number;
  totalPages?: number;
  onTableReady?: (table: ReturnType<typeof useReactTable<TData>>) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageSize = 10,
  pageIndex,
  totalPages,
  onTableReady,
}: Readonly<DataTableProps<TData, TValue>>) {
  const { t } = useLanguage();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Disable client-side pagination if totalPages is provided (server-side pagination)
    ...(totalPages === undefined
      ? {
          getPaginationRowModel: getPaginationRowModel(),
        }
      : {
          manualPagination: true,
          pageCount: totalPages,
        }),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination: {
        pageIndex: pageIndex ?? 0,
        pageSize,
      },
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  React.useEffect(() => {
    if (onTableReady) {
      onTableReady(table);
    }
  }, [table, onTableReady]);

  return (
    <div className="space-y-4 rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const meta = header.column.columnDef.meta as { style?: React.CSSProperties } | undefined;
                return (
                  <TableHead key={header.id} style={meta?.style}>
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center space-x-1 text-nowrap">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <ChevronUp className="ml-2 h-4 w-4" />,
                          desc: <ChevronDown className="ml-2 h-4 w-4" />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta as { style?: React.CSSProperties } | undefined;
                  return (
                    <TableCell key={cell.id} style={meta?.style}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length}>
                <div className="flex flex-col items-center justify-center gap-4 p-1.5">
                  <img src="/assets/icons/no-data-icon.svg" alt="No data" className="h-10 w-16" />
                  <p className="text-sm font-normal text-(--color-table-no-data-icon)">{t('dataTable.noResults')}</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
